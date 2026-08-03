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
   * Find a user by email address
   */
  async findByEmail(email) {
    if (!email) return null;
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { addresses: true },
    });
  },

  /**
   * Find a user by their Clerk ID (legacy fallback)
   */
  async findByClerkId(clerkId) {
    if (!clerkId) return null;
    return prisma.user.findUnique({
      where: { clerkId },
      include: { addresses: true },
    });
  },

  /**
   * Create a new user with hashed password
   */
  async createUser({ email, password, name, phone, role = 'CUSTOMER' }) {
    return prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password,
        name,
        phone,
        role,
      },
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
