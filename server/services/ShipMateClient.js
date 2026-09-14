// ============================================================
//  ShipMateClient — Production HTTP Client for ShipMate Logistics API
//  Communicates strictly over public REST contracts.
//  Zero direct database access, zero internal class imports.
// ============================================================

export class ShipMateApiError extends Error {
  constructor(message, { status, code, details, isTransient = false, idempotencyKey } = {}) {
    super(message);
    this.name = 'ShipMateApiError';
    this.status = status;
    this.code = code || 'SHIPMATE_API_ERROR';
    this.details = details;
    this.isTransient = isTransient;
    this.idempotencyKey = idempotencyKey;
  }
}

export class ShipMateClient {
  constructor(config = {}) {
    this.baseUrl = (config.baseUrl || process.env.SHIPMATE_BASE_URL || 'http://localhost:8080').replace(/\/+$/, '');
    this.apiKey = config.apiKey || process.env.SHIPMATE_API_KEY || '';
    this.organizationCode = config.organizationCode || process.env.SHIPMATE_ORGANIZATION_CODE || '';
    this.timeoutMs = config.timeoutMs || 10000;
    this.maxRetries = config.maxRetries !== undefined ? config.maxRetries : 2;
  }

  /**
   * Helper to mask API keys for safe logging
   */
  static maskSecret(secret) {
    if (!secret || typeof secret !== 'string') return '[NONE]';
    if (secret.length <= 8) return '***';
    return `${secret.substring(0, 4)}...${secret.substring(secret.length - 4)}`;
  }

  /**
   * Check if credentials are configured
   */
  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Base request method with timeouts, retry for transient errors, and sanitized logging
   */
  async request(endpoint, { method = 'GET', body, headers = {}, idempotencyKey, retryCount = 0 } = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const reqHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    };

    if (this.apiKey) {
      reqHeaders['X-API-Key'] = this.apiKey;
    }

    if (this.organizationCode) {
      reqHeaders['X-Organization-Code'] = this.organizationCode;
    }

    if (idempotencyKey) {
      reqHeaders['Idempotency-Key'] = idempotencyKey;
    }

    // Masked headers for safe debugging
    const maskedHeaders = { ...reqHeaders };
    if (maskedHeaders['X-API-Key']) {
      maskedHeaders['X-API-Key'] = ShipMateClient.maskSecret(maskedHeaders['X-API-Key']);
    }
    if (maskedHeaders['Authorization']) {
      maskedHeaders['Authorization'] = 'Bearer ***';
    }

    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      console.log(`[ShipMateClient] ${method} ${url} | Idempotency: ${idempotencyKey || 'none'} | Org: ${this.organizationCode || 'none'}`);

      const response = await fetch(url, {
        method,
        headers: reqHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutTimer);

      const contentType = response.headers.get('content-type') || '';
      let responseData = null;
      if (contentType.includes('application/json')) {
        responseData = await response.json().catch(() => null);
      } else {
        const text = await response.text().catch(() => '');
        responseData = text ? { raw: text } : null;
      }

      if (!response.ok) {
        const status = response.status;
        const isTransient = [502, 503, 504, 429].includes(status);
        const errorMsg = responseData?.message || responseData?.error || `ShipMate request failed with HTTP ${status}`;

        // Retry transient errors if within limit
        if (isTransient && retryCount < this.maxRetries) {
          const delay = Math.pow(2, retryCount) * 1000;
          console.warn(`[ShipMateClient] Transient error ${status} for ${endpoint}. Retrying in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.request(endpoint, { method, body, headers, idempotencyKey, retryCount: retryCount + 1 });
        }

        throw new ShipMateApiError(errorMsg, {
          status,
          code: responseData?.code || `HTTP_${status}`,
          details: responseData,
          isTransient,
          idempotencyKey,
        });
      }

      console.log(`[ShipMateClient] ${method} ${url} -> SUCCESS (${response.status})`);
      return responseData;
    } catch (err) {
      clearTimeout(timeoutTimer);

      if (err instanceof ShipMateApiError) {
        throw err;
      }

      const isTimeout = err.name === 'AbortError';
      const isNetworkError = err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.message?.includes('fetch failed') || isTimeout;

      if (isNetworkError && retryCount < this.maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000;
        console.warn(`[ShipMateClient] Network error (${err.message}) for ${endpoint}. Retrying in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.request(endpoint, { method, body, headers, idempotencyKey, retryCount: retryCount + 1 });
      }

      throw new ShipMateApiError(
        isTimeout ? `ShipMate API request timed out after ${this.timeoutMs}ms` : `ShipMate connection failed: ${err.message}`,
        {
          status: isTimeout ? 504 : 503,
          code: isTimeout ? 'TIMEOUT' : 'CONNECTION_FAILED',
          isTransient: true,
          idempotencyKey,
        }
      );
    }
  }

  /**
   * Create a new shipment in ShipMate
   * @param {Object} payload ExternalCreateShipmentRequest
   * @param {string} idempotencyKey Deterministic idempotency key (e.g. STB-ORDER-10001)
   * @returns {Promise<Object>} ExternalShipmentResponse
   */
  async createShipment(payload, idempotencyKey) {
    if (!idempotencyKey) {
      throw new ShipMateApiError('Idempotency key is required for createShipment to guarantee at-most-once execution', {
        status: 400,
        code: 'MISSING_IDEMPOTENCY_KEY',
      });
    }

    return this.request('/api/v1/shipments', {
      method: 'POST',
      body: payload,
      idempotencyKey,
    });
  }

  /**
   * Get shipment by internal ShipMate shipment UUID
   * @param {string} shipmentId UUID
   */
  async getShipment(shipmentId) {
    return this.request(`/api/v1/shipments/${shipmentId}`, {
      method: 'GET',
    });
  }

  /**
   * Get tracking information by ShipMate tracking number
   * @param {string} trackingNumber e.g. SHP-2026-XXXXXX
   */
  async getTracking(trackingNumber) {
    return this.request(`/api/v1/shipments/${encodeURIComponent(trackingNumber)}/tracking`, {
      method: 'GET',
    });
  }

  /**
   * Cancel an existing shipment
   * @param {string} shipmentId UUID
   */
  async cancelShipment(shipmentId) {
    return this.request(`/api/v1/shipments/${shipmentId}/cancel`, {
      method: 'POST',
    });
  }
}

// Export singleton instance initialized with current env vars
export const shipMateClient = new ShipMateClient();
