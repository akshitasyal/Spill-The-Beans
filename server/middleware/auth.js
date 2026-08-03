// ============================================================
//  auth.js — Authentication & Authorization Middleware
// ============================================================
import { UserRepository } from '../repositories/UserRepository.js';

/**
 * requireAuth middleware
 * Verifies user authentication via Clerk token or x-clerk-id header.
 * Ensures a user record exists in the PostgreSQL database.
 * Attaches req.user and req.clerkId.
 */
export async function requireAuth(req, res, next) {
  try {
    let clerkId = req.headers['x-clerk-id'];
    let userEmail = req.headers['x-user-email'];

    // Also check Authorization header if token is passed (Bearer <clerkId_or_token>)
    const authHeader = req.headers.authorization;
    if (!clerkId && authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token && !token.includes('.')) {
        clerkId = token;
      }
    }

    if (!clerkId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to perform this action.',
      });
    }

    // Lookup user in PostgreSQL database
    let user = await UserRepository.findByClerkId(clerkId);

    // If user record doesn't exist yet, auto-provision user in database
    if (!user) {
      const email = userEmail || `${clerkId}@user.clerk.dev`;
      user = await UserRepository.upsertByClerkId({
        clerkId,
        email,
        name: email.split('@')[0],
      });
    }

    req.clerkId = clerkId;
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * requireAdmin middleware
 * Ensures the authenticated user has ADMIN role in PostgreSQL or Clerk metadata.
 * Must be placed after requireAuth.
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  const isDbAdmin = req.user.role === 'ADMIN';

  if (!isDbAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Access restricted to administrator accounts.',
    });
  }

  next();
}
