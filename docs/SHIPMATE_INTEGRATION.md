# Spill the Beans — ShipMate 3PL Logistics Integration Guide

This document provides a comprehensive technical reference for the **Spill the Beans → ShipMate** machine-to-machine logistics integration.

---

## 1. Overview & Architecture

Spill the Beans connects to **ShipMate** as an external enterprise merchant consuming ShipMate's public REST APIs.
- **Zero-trust machine-to-machine boundary**: Spill the Beans never accesses ShipMate's database, never imports internal classes, and interacts strictly over authenticated HTTP.
- **Server-Side Credential Isolation**: ShipMate API keys and organization codes reside exclusively on the server (`/server/.env`). No secrets ever reach the browser bundle or client requests.
- **Resilient Non-Blocking Placement**: Customer orders are always persisted in Spill the Beans' database first. If ShipMate is temporarily unavailable, the order is stored with `shipmateIntegrationStatus = SHIPMENT_FAILED` and is retryable without data loss.
- **Deterministic Idempotency**: All shipment creation requests use an `Idempotency-Key: STB-ORDER-<orderId>` header derived from the stable order identifier. Retries return the existing ShipMate shipment without creating duplicates.

```
Customer Checkout (Browser)
          ↓
Spill the Beans Backend (POST /api/orders)
          ↓ (1. Persist Order in PostgreSQL)
Order Saved (Status: PLACED)
          ↓ (2. ShipMateIntegrationService)
ShipMate Public API (POST /api/v1/shipments)
  - Headers: X-API-Key, X-Organization-Code, Idempotency-Key
          ↓ (3. Return Shipment ID + Tracking)
Shipment Created (e.g. SHP-2026-XXXXXX)
          ↓ (4. Store Reference)
Spill the Beans Order updated with ShipMate tracking ID & live status
```

---

## 2. Environment Configuration

Add the following configuration to `server/.env`:

```env
# ── ShipMate 3PL Logistics Configuration ──
SHIPMATE_BASE_URL=http://localhost:8080
SHIPMATE_API_KEY=YOUR_SHIPMATE_API_KEY
SHIPMATE_ORGANIZATION_CODE=YOUR_SHIPMATE_ORGANIZATION_CODE
SHIPMATE_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET

# Cafe Roastery Pickup Location Defaults
SHIPMATE_PICKUP_NAME=Spill the Beans Cafe & Roastery
SHIPMATE_PICKUP_PHONE=+919876543210
SHIPMATE_PICKUP_LINE1=123 Coffee Roasters Lane, Indiranagar
SHIPMATE_PICKUP_LINE2=Near Metro Pillar 42
SHIPMATE_PICKUP_CITY=Bengaluru
SHIPMATE_PICKUP_STATE=Karnataka
SHIPMATE_PICKUP_PINCODE=560038
SHIPMATE_PICKUP_COUNTRY=India
```

> [!WARNING]
> Never commit real API keys to version control or expose them in client-side `.env` files.

---

## 3. Obtaining Credentials

1. **API Key**: Log into the **ShipMate Business Portal** as an organization admin (`Spill the Beans`). Navigate to **Developers → API Keys** and generate a new key with `SHIPMENTS_CREATE`, `SHIPMENTS_READ`, and `TRACKING_READ` scopes.
2. **Organization Code**: In the **ShipMate Business Portal**, the public organization code (e.g., `STB-7821`) is displayed at the top of the **Developers** hub.

---

## 4. API Endpoints & Request Mapping

### Shipment Creation Contract
- **Endpoint**: `POST /api/v1/shipments`
- **Headers**:
  - `Content-Type: application/json`
  - `X-API-Key: <SHIPMATE_API_KEY>`
  - `X-Organization-Code: <SHIPMATE_ORGANIZATION_CODE>`
  - `Idempotency-Key: STB-ORDER-<orderId>`

### Request Body Schema (`ExternalCreateShipmentRequest`):
```json
{
  "referenceId": "STB-10001",
  "deliveryType": "STANDARD",
  "pickupAddress": {
    "name": "Spill the Beans Cafe & Roastery",
    "phone": "+919876543210",
    "addressLine1": "123 Coffee Roasters Lane, Indiranagar",
    "addressLine2": "Near Metro Pillar 42",
    "city": "Bengaluru",
    "state": "Karnataka",
    "postalCode": "560038",
    "country": "India"
  },
  "deliveryAddress": {
    "name": "Rahul Sharma",
    "phone": "+919876501234",
    "addressLine1": "Flat 402, Green Valley Apartments",
    "addressLine2": "Outer Ring Road, Bellandur",
    "city": "Bengaluru",
    "state": "Karnataka",
    "postalCode": "560103",
    "country": "India"
  },
  "packageInfo": {
    "weight": 1.20,
    "length": 20.0,
    "width": 15.0,
    "height": 10.0,
    "packageType": "BOX",
    "declaredValue": 850.00,
    "isFragile": false,
    "requiresColdStorage": false
  }
}
```

### Successful Response Schema (`ExternalShipmentResponse`):
```json
{
  "shipmentId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "trackingNumber": "SHP-2026-STB10001",
  "referenceId": "STB-10001",
  "status": "CREATED",
  "price": 120.00,
  "currency": "INR",
  "deliveryType": "STANDARD",
  "estimatedDelivery": "2026-09-15T12:00:00Z",
  "createdAt": "2026-09-13T20:00:00Z"
}
```

---

## 5. Developer cURL Example

You can test the public ShipMate endpoint directly from your terminal:

```bash
curl -X POST "YOUR_SHIPMATE_BASE_URL/api/v1/shipments" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_SHIPMATE_API_KEY" \
  -H "X-Organization-Code: YOUR_SHIPMATE_ORGANIZATION_CODE" \
  -H "Idempotency-Key: STB-ORDER-10001" \
  -d '{
    "referenceId": "STB-10001",
    "deliveryType": "STANDARD",
    "pickupAddress": {
      "name": "Spill the Beans Cafe & Roastery",
      "phone": "+919876543210",
      "addressLine1": "123 Coffee Roasters Lane, Indiranagar",
      "city": "Bengaluru",
      "state": "Karnataka",
      "postalCode": "560038",
      "country": "India"
    },
    "deliveryAddress": {
      "name": "Rahul Sharma",
      "phone": "+919876501234",
      "addressLine1": "Flat 402, Green Valley Apartments",
      "city": "Bengaluru",
      "state": "Karnataka",
      "postalCode": "560103",
      "country": "India"
    },
    "packageInfo": {
      "weight": 1.2,
      "length": 20.0,
      "width": 15.0,
      "height": 10.0,
      "packageType": "BOX",
      "declaredValue": 850.00,
      "isFragile": false,
      "requiresColdStorage": false
    }
  }'
```

---

## 6. Local Testing & Verification Workflow

### Step 1: Start ShipMate Backend
Start the ShipMate Spring Boot server on port `8080`.

### Step 2: Start Spill the Beans Backend & Frontend
```bash
# Start backend
cd server && npm run dev

# Start frontend (in separate terminal)
npm run dev
```

### Step 3: Send Test Order via Admin Operations Console
1. Open Spill the Beans Admin Portal (`/admin/orders`).
2. Click **"Send Test Order to ShipMate"**.
3. Verify the realistic order `STB-10001` is dispatched over real HTTP to ShipMate.
4. Verify the tracking number (e.g. `SHP-2026-XXXXXX`) is returned and stored against the order.

### Step 4: Verify in ShipMate Dashboard
1. Log into ShipMate as Spill the Beans.
2. Navigate to **Shipments**.
3. Confirm that `STB-10001` appears in the list under Spill the Beans with status `CREATED`.
4. Progress the shipment lifecycle (`ASSIGNED` → `PICKED_UP` → `IN_TRANSIT` → `DELIVERED`).
5. Verify live status updates reflect in Spill the Beans tracking console.
