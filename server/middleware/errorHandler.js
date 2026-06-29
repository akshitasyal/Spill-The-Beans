// ============================================================
//  errorHandler.js — Global Express error handling middleware
// ============================================================

/**
 * Centralised error handler.
 * Must be the LAST middleware registered in app.js.
 * Express identifies error-handling middleware by the 4-argument signature.
 */
export function errorHandler(err, req, res, next) {
  console.error('[ERROR]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
  });

  // Prisma-specific errors
  if (err.code === 'P2002') {
    // Unique constraint violation
    return res.status(409).json({
      success: false,
      message: 'A record with this data already exists.',
    });
  }

  if (err.code === 'P2025') {
    // Record not found
    return res.status(404).json({
      success: false,
      message: 'Record not found.',
    });
  }

  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : 'An unexpected error occurred.';

  return res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * 404 handler — registered before errorHandler for unknown routes
 */
export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found.`,
  });
}
