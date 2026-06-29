// ============================================================
//  UserController — Handles /api/users endpoints
// ============================================================
import { UserRepository } from '../repositories/UserRepository.js';

export const UserController = {
  /**
   * GET /api/users/:clerkId
   * Fetch user profile + addresses
   */
  async getByClerkId(req, res, next) {
    try {
      const user = await UserRepository.findByClerkId(req.params.clerkId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/users
   * Create or update user on Clerk webhook / first login
   */
  async upsert(req, res, next) {
    try {
      const { clerkId, email, name, phone } = req.body;
      const user = await UserRepository.upsertByClerkId({ clerkId, email, name, phone });
      res.status(201).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/users/:clerkId
   * Update profile (name, phone)
   */
  async update(req, res, next) {
    try {
      const user = await UserRepository.findByClerkId(req.params.clerkId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      const updated = await UserRepository.updateUser(user.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  // ── Addresses ──────────────────────────────────────────────

  /**
   * GET /api/users/:clerkId/addresses
   */
  async getAddresses(req, res, next) {
    try {
      const user = await UserRepository.findByClerkId(req.params.clerkId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      const addresses = await UserRepository.getUserAddresses(user.id);
      res.json({ success: true, data: addresses });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/users/:clerkId/addresses
   */
  async addAddress(req, res, next) {
    try {
      const user = await UserRepository.findByClerkId(req.params.clerkId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      const address = await UserRepository.addAddress(user.id, req.body);
      res.status(201).json({ success: true, data: address });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/users/:clerkId/addresses/:addressId
   */
  async updateAddress(req, res, next) {
    try {
      const user = await UserRepository.findByClerkId(req.params.clerkId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      const address = await UserRepository.updateAddress(user.id, req.params.addressId, req.body);
      res.json({ success: true, data: address });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/users/:clerkId/addresses/:addressId
   */
  async deleteAddress(req, res, next) {
    try {
      const user = await UserRepository.findByClerkId(req.params.clerkId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      await UserRepository.deleteAddress(user.id, req.params.addressId);
      res.json({ success: true, message: 'Address deleted.' });
    } catch (err) {
      next(err);
    }
  },
};
