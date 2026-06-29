// ============================================================
//  UserRepository — Data access layer for User & Address
// ============================================================
import prisma from '../db/client.js';

export const UserRepository = {
  /**
   * Find a user by their internal database ID
   */
  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: { addresses: true },
    });
  },

  /**
   * Find a user by their Clerk ID (for auth sync)
   */
  async findByClerkId(clerkId) {
    return prisma.user.findUnique({
      where: { clerkId },
      include: { addresses: true },
    });
  },

  /**
   * Create a new user (called on first Clerk webhook)
   */
  async createUser({ clerkId, email, name, phone, role = 'CUSTOMER' }) {
    return prisma.user.create({
      data: { clerkId, email, name, phone, role },
    });
  },

  /**
   * Upsert user — create or update on Clerk sync
   */
  async upsertByClerkId({ clerkId, email, name, phone }) {
    return prisma.user.upsert({
      where: { clerkId },
      update: { email, name, phone },
      create: { clerkId, email, name, phone },
    });
  },

  /**
   * Update user profile (name, phone)
   */
  async updateUser(id, { name, phone }) {
    return prisma.user.update({
      where: { id },
      data: { name, phone },
    });
  },

  /**
   * Get all addresses for a user
   */
  async getUserAddresses(userId) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
    });
  },

  /**
   * Add a new address for a user.
   * If isDefault is true, unset any existing default first.
   */
  async addAddress(userId, addressData) {
    if (addressData.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }
    return prisma.address.create({
      data: { userId, ...addressData },
    });
  },

  /**
   * Update an existing address
   */
  async updateAddress(userId, addressId, addressData) {
    if (addressData.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }
    return prisma.address.update({
      where: { id: addressId },
      data: addressData,
    });
  },

  /**
   * Delete an address by ID (only if it belongs to the user)
   */
  async deleteAddress(userId, addressId) {
    return prisma.address.deleteMany({
      where: { id: addressId, userId },
    });
  },
};
