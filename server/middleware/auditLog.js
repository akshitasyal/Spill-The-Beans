import logger from './logger.js';

/**
 * Audit Log Middleware: logs administrative actions (POST/PUT/PATCH/DELETE on admin endpoints)
 */
export const auditLogger = (actionName) => {
  return (req, res, next) => {
    const originalSend = res.send;
    const startTime = Date.now();

    // Intercept response to check if action was successful
    res.send = function (body) {
      const responseTime = Date.now() - startTime;
      res.send = originalSend; // restore original send

      const statusCode = res.statusCode;
      const adminId = req.user?.id || req.user?.email || 'system-admin';

      const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

      // Log only state-changing actions
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        const auditPayload = {
          event: 'ADMIN_ACTION',
          action: actionName || `${req.method} ${req.originalUrl}`,
          adminId,
          method: req.method,
          url: req.originalUrl,
          statusCode,
          ip,
          responseTimeMs: responseTime,
          timestamp: new Date().toISOString(),
        };

        if (statusCode >= 200 && statusCode < 300) {
          logger.info(`Audit Log: Admin ${adminId} succeeded in ${auditPayload.action}`, auditPayload);
        } else {
          logger.warn(`Audit Log: Admin ${adminId} failed in ${auditPayload.action} (Status ${statusCode})`, auditPayload);
        }
      }

      return originalSend.call(this, body);
    };

    next();
  };
};
