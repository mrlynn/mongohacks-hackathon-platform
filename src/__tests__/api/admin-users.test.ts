import { NextRequest } from 'next/server';
import mongoose from 'mongoose';

// Mock dependencies before importing route handlers
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/db/connection', () => ({
  connectToDatabase: jest.fn(),
}));

import { auth } from '@/lib/auth';
import { setupTestDB, teardownTestDB, clearCollections } from '@/__tests__/utils/db';
import { UserModel } from '@/lib/db/models/User';

const mockAuth = auth as jest.Mock;

// Import route handlers AFTER mocking
import { DELETE } from '@/app/api/admin/users/[userId]/route';
import { POST as BanPOST } from '@/app/api/admin/users/[userId]/ban/route';

// Helper to create a session mock
function mockSession(overrides: {
  id?: string;
  role?: string;
  name?: string;
  email?: string;
}) {
  return {
    user: {
      id: overrides.id || 'admin-id',
      role: overrides.role || 'admin',
      name: overrides.name || 'Admin User',
      email: overrides.email || 'admin@test.com',
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
  } as any;
}

describe('Admin Users API', () => {
  let participantId: string;
  let adminId: string;
  let superAdminId: string;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearCollections();
    jest.clearAllMocks();

    // Seed test users
    const participant = await UserModel.create({
      email: 'participant@test.com',
      name: 'Participant User',
      passwordHash: 'hashed-password',
      role: 'participant',
    });
    const admin = await UserModel.create({
      email: 'admin@test.com',
      name: 'Admin User',
      passwordHash: 'hashed-password',
      role: 'admin',
    });
    const superAdmin = await UserModel.create({
      email: 'superadmin@test.com',
      name: 'Super Admin',
      passwordHash: 'hashed-password',
      role: 'super_admin',
    });

    participantId = participant._id.toString();
    adminId = admin._id.toString();
    superAdminId = superAdmin._id.toString();
  });

  // ============================================================
  // DELETE /api/admin/users/[userId]
  // ============================================================
  describe('DELETE /api/admin/users/[userId]', () => {
    it('returns 401 when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/users/123');
      const response = await DELETE(request, {
        params: Promise.resolve({ userId: participantId }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('returns 403 when role is participant', async () => {
      mockAuth.mockResolvedValue(mockSession({ role: 'participant' }));

      const request = new NextRequest('http://localhost:3000/api/admin/users/123');
      const response = await DELETE(request, {
        params: Promise.resolve({ userId: participantId }),
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Admin access required');
    });

    it('returns 403 when role is judge', async () => {
      mockAuth.mockResolvedValue(mockSession({ role: 'judge' }));

      const request = new NextRequest('http://localhost:3000/api/admin/users/123');
      const response = await DELETE(request, {
        params: Promise.resolve({ userId: participantId }),
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Admin access required');
    });

    it('returns 404 when user not found', async () => {
      mockAuth.mockResolvedValue(mockSession({ role: 'admin' }));

      const fakeId = new mongoose.Types.ObjectId().toString();
      const request = new NextRequest(`http://localhost:3000/api/admin/users/${fakeId}`);
      const response = await DELETE(request, {
        params: Promise.resolve({ userId: fakeId }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });

    it('returns 403 when admin tries to delete super_admin', async () => {
      mockAuth.mockResolvedValue(mockSession({ role: 'admin' }));

      const request = new NextRequest(`http://localhost:3000/api/admin/users/${superAdminId}`);
      const response = await DELETE(request, {
        params: Promise.resolve({ userId: superAdminId }),
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Cannot delete super administrators');
    });

    it('returns 403 when admin tries to delete another admin', async () => {
      mockAuth.mockResolvedValue(mockSession({ role: 'admin' }));

      const request = new NextRequest(`http://localhost:3000/api/admin/users/${adminId}`);
      const response = await DELETE(request, {
        params: Promise.resolve({ userId: adminId }),
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Only super administrators can delete admins');
    });

    it('successfully soft-deletes a participant user', async () => {
      mockAuth.mockResolvedValue(mockSession({ role: 'admin' }));

      const request = new NextRequest(`http://localhost:3000/api/admin/users/${participantId}`);
      const response = await DELETE(request, {
        params: Promise.resolve({ userId: participantId }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('User soft deleted successfully');

      // Verify in DB
      const deletedUser = await UserModel.findById(participantId);
      expect(deletedUser!.deletedAt).toBeDefined();
      expect(deletedUser!.banned).toBe(true);
      expect(deletedUser!.bannedReason).toBe('Account deleted by administrator');
    });

    it('allows super_admin to delete an admin', async () => {
      mockAuth.mockResolvedValue(mockSession({ role: 'super_admin' }));

      const request = new NextRequest(`http://localhost:3000/api/admin/users/${adminId}`);
      const response = await DELETE(request, {
        params: Promise.resolve({ userId: adminId }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      const deletedUser = await UserModel.findById(adminId);
      expect(deletedUser!.deletedAt).toBeDefined();
      expect(deletedUser!.banned).toBe(true);
    });

    it('returns 403 when even super_admin tries to delete a super_admin', async () => {
      mockAuth.mockResolvedValue(mockSession({ role: 'super_admin' }));

      const request = new NextRequest(`http://localhost:3000/api/admin/users/${superAdminId}`);
      const response = await DELETE(request, {
        params: Promise.resolve({ userId: superAdminId }),
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Cannot delete super administrators');
    });
  });

  // ============================================================
  // POST /api/admin/users/[userId]/ban
  // ============================================================
  describe('POST /api/admin/users/[userId]/ban', () => {
    function banRequest(userId: string, body: object = {}) {
      return new NextRequest(`http://localhost:3000/api/admin/users/${userId}/ban`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
    }

    it('returns 401 when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const request = banRequest(participantId, {});
      const response = await BanPOST(request, {
        params: Promise.resolve({ userId: participantId }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('returns 403 when non-admin role', async () => {
      mockAuth.mockResolvedValue(mockSession({ role: 'participant' }));

      const request = banRequest(participantId, {});
      const response = await BanPOST(request, {
        params: Promise.resolve({ userId: participantId }),
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Admin access required');
    });

    it('returns 403 when admin tries to ban super_admin', async () => {
      mockAuth.mockResolvedValue(mockSession({ role: 'admin' }));

      const request = banRequest(superAdminId, { reason: 'test' });
      const response = await BanPOST(request, {
        params: Promise.resolve({ userId: superAdminId }),
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Cannot ban super administrators');
    });

    it('returns 403 when admin tries to ban another admin', async () => {
      mockAuth.mockResolvedValue(mockSession({ role: 'admin' }));

      const request = banRequest(adminId, { reason: 'test' });
      const response = await BanPOST(request, {
        params: Promise.resolve({ userId: adminId }),
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Only super administrators can ban admins');
    });

    it('returns 404 when user not found', async () => {
      mockAuth.mockResolvedValue(mockSession({ role: 'admin' }));

      const fakeId = new mongoose.Types.ObjectId().toString();
      const request = banRequest(fakeId, {});
      const response = await BanPOST(request, {
        params: Promise.resolve({ userId: fakeId }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });

    it('successfully bans a user with reason', async () => {
      mockAuth.mockResolvedValue(mockSession({ role: 'admin' }));

      const request = banRequest(participantId, { reason: 'Violated community guidelines' });
      const response = await BanPOST(request, {
        params: Promise.resolve({ userId: participantId }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.banned).toBe(true);
      expect(data.user.bannedReason).toBe('Violated community guidelines');
      expect(data.user.bannedAt).toBeDefined();

      // Verify in DB
      const bannedUser = await UserModel.findById(participantId);
      expect(bannedUser!.banned).toBe(true);
      expect(bannedUser!.bannedReason).toBe('Violated community guidelines');
    });

    it('successfully bans a user without reason (uses default)', async () => {
      mockAuth.mockResolvedValue(mockSession({ role: 'admin' }));

      const request = banRequest(participantId, {});
      const response = await BanPOST(request, {
        params: Promise.resolve({ userId: participantId }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.banned).toBe(true);
      expect(data.user.bannedReason).toBe('No reason provided');
    });

    it('successfully unbans a previously banned user', async () => {
      // First ban the user
      await UserModel.findByIdAndUpdate(participantId, {
        banned: true,
        bannedAt: new Date(),
        bannedReason: 'Initial ban',
      });

      mockAuth.mockResolvedValue(mockSession({ role: 'admin' }));

      const request = banRequest(participantId, {});
      const response = await BanPOST(request, {
        params: Promise.resolve({ userId: participantId }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.banned).toBe(false);

      // Verify in DB
      const unbannedUser = await UserModel.findById(participantId);
      expect(unbannedUser!.banned).toBe(false);
      expect(unbannedUser!.bannedAt).toBeUndefined();
      expect(unbannedUser!.bannedReason).toBeUndefined();
    });

    it('returns 400 with invalid ban reason (too long)', async () => {
      mockAuth.mockResolvedValue(mockSession({ role: 'admin' }));

      const longReason = 'x'.repeat(501);
      const request = banRequest(participantId, { reason: longReason });
      const response = await BanPOST(request, {
        params: Promise.resolve({ userId: participantId }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request');
      expect(data.details).toBeDefined();
    });

    it('returns 400 with invalid ban reason (empty string)', async () => {
      mockAuth.mockResolvedValue(mockSession({ role: 'admin' }));

      const request = banRequest(participantId, { reason: '' });
      const response = await BanPOST(request, {
        params: Promise.resolve({ userId: participantId }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request');
    });

    it('allows super_admin to ban an admin', async () => {
      mockAuth.mockResolvedValue(mockSession({ role: 'super_admin' }));

      const request = banRequest(adminId, { reason: 'Admin abuse' });
      const response = await BanPOST(request, {
        params: Promise.resolve({ userId: adminId }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.banned).toBe(true);
    });
  });
});
