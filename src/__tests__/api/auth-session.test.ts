import { NextRequest } from 'next/server';

// Mock dependencies before importing route handlers
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/db/connection', () => ({
  connectToDatabase: jest.fn(),
}));

import { auth } from '@/lib/auth';

const mockAuth = auth as jest.Mock;

// Import route AFTER mocking
import { GET } from '@/app/api/auth/session/route';

describe('GET /api/auth/session', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns { user: null } when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ user: null });
  });

  it('returns user data when authenticated', async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
      },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      user: {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
      },
    });
  });

  it('returns user data with all session fields', async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: 'user-456',
        name: 'Participant User',
        email: 'participant@example.com',
        role: 'participant',
      },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user.id).toBe('user-456');
    expect(data.user.name).toBe('Participant User');
    expect(data.user.email).toBe('participant@example.com');
    expect(data.user.role).toBe('participant');
  });

  it('returns 500 with { user: null } on error (graceful degradation)', async () => {
    mockAuth.mockRejectedValue(new Error('Auth service unavailable'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ user: null });
  });

  it('returns { user: null } when session exists but user is undefined', async () => {
    mockAuth.mockResolvedValue({
      user: undefined,
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ user: null });
  });
});
