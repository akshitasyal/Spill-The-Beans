// Helper to resolve user from req.user or identifier param
async function resolveUser(req) {
  if (req.user) return req.user;
  const param = req.params.clerkId || req.params.id;
  if (!param) return null;
  let user = await UserRepository.findById(param);
  if (!user) user = await UserRepository.findByClerkId(param);
  return user;
}

export const UserController = {
  /**
   * GET /api/users/profile or /api/users/:id
   */
  async getByClerkId(req, res, next) {
    try {
      const user = await resolveUser(req);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      delete user.password;
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/users
   */
  async upsert(req, res, next) {
    try {
      const { email, name, phone } = req.body;
      let user = await UserRepository.findByEmail(email);
      if (!user) {
        user = await UserRepository.createUser({ email, name, phone });
      } else {
        user = await UserRepository.updateUser(user.id, { name, phone });
      }
      delete user.password;
      res.status(201).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/users/:id or /api/users/me
   */
  async update(req, res, next) {
    try {
      const user = await resolveUser(req);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      const updated = await UserRepository.updateUser(user.id, req.body);
      delete updated.password;
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  // ── Addresses ──────────────────────────────────────────────

  /**
   * GET /api/users/addresses or /api/users/:id/addresses
   */
  async getAddresses(req, res, next) {
    try {
      const user = await resolveUser(req);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      const addresses = await UserRepository.getUserAddresses(user.id);
      res.json({ success: true, data: addresses });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/users/addresses or /api/users/:id/addresses
   */
  async addAddress(req, res, next) {
    try {
      const user = await resolveUser(req);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      const address = await UserRepository.addAddress(user.id, req.body);
      res.status(201).json({ success: true, data: address });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/users/addresses/:addressId or /api/users/:id/addresses/:addressId
   */
  async updateAddress(req, res, next) {
    try {
      const user = await resolveUser(req);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      const address = await UserRepository.updateAddress(user.id, req.params.addressId, req.body);
      res.json({ success: true, data: address });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/users/addresses/:addressId or /api/users/:id/addresses/:addressId
   */
  async deleteAddress(req, res, next) {
    try {
      const user = await resolveUser(req);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      await UserRepository.deleteAddress(user.id, req.params.addressId);
      res.json({ success: true, message: 'Address deleted.' });
    } catch (err) {
      next(err);
    }
  },
};

