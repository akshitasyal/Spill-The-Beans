// ============================================================
//  AuthController.js -- Handles /api/auth endpoints
// ============================================================
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'spill_the_beans_jwt_secret_key_2026_super_secure';
const JWT_EXPIRES_IN = '7d';

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function sanitizeUser(user) {
  const sanitized = { ...user };
  delete sanitized.password;
  return sanitized;
}

export const AuthController = {
  /**
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { email, password, name, firstName, lastName, phone, role } = req.body;
      
      if (!email || !email.trim()) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
      }
      if (!password || password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const existing = await UserRepository.findByEmail(cleanEmail);
      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const fullName = name || (firstName || lastName ? `${firstName || ''} ${lastName || ''}`.trim() : null) || cleanEmail.split('@')[0];


      const user = await UserRepository.createUser({
        email: cleanEmail,
        password: hashedPassword,
        name: fullName,
        phone: phone || null,
        role: role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER',
      });

      const token = generateToken(user);
      res.status(201).json({
        success: true,
        token,
        user: sanitizeUser(user),
        message: 'Account created successfully.',
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password.' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const user = await UserRepository.findByEmail(cleanEmail);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      // If user has no password set, set it on first login
      if (!user.password) {
        const hashed = await bcrypt.hash(password, 10);
        await UserRepository.updateUser(user.id, { password: hashed });
      } else {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }
      }

      const token = generateToken(user);
      res.json({
        success: true,
        token,
        user: sanitizeUser(user),
        message: 'Logged in successfully.',
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/auth/me
   */
  async me(req, res) {
    res.json({
      success: true,
      user: sanitizeUser(req.user),
    });
  },

  /**
   * POST /api/auth/logout
   */
  async logout(req, res) {
    res.json({
      success: true,
      message: 'Logged out successfully.',
    });
  },
};
