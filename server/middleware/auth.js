// ============================================================
//  auth.js — Authentication & Authorization Middleware
// ============================================================
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'spill_the_beans_jwt_secret_key_2026_super_secure';

/**
 * requireAuth middleware
 * Verifies JWT token from Authorization header (`Bearer <token>`) or `x-auth-token`.
 * Attaches req.user to request.
 * Returns 401 Unauthorized for missing, invalid, or expired tokens.
 */
export async function requireAuth(req, res, next) {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to perform this action.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token. Please sign in again.',
      });
    }

    const userId = decoded.userId || decoded.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload.',
      });
    }

    const user = await UserRepository.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists.',
      });
    }

    // Omit sensitive data before attaching to request
    delete user.password;
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * requireAdmin middleware
 * Ensures the authenticated user has ADMIN role.
 * Must be placed after requireAuth.
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Access restricted to administrator accounts.',
    });
  }

  next();
}

