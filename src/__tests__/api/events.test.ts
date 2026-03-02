import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { setupTestDB, teardownTestDB, clearCollections, seedTestData } from '../utils/db';
import { testUsers } from '../fixtures/users';
import { testEvent } from '../fixtures/events';

// Mock auth BEFORE importing routes
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  handlers: {},
}));
jest.mock('@/lib/db/connection', () => ({
  connectToDatabase: jest.fn(),
}));

import { auth } from '@/lib/auth';
const mockAuth = auth as jest.Mock;

// Import route AFTER mocking
import { GET, POST } from '@/app/api/events/route';

beforeAll(async () => {
  await setupTestDB();
  // Disable autoIndex to prevent 2dsphere index from blocking inserts without coordinates
  mongoose.set('autoIndex', false);
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearCollections();
  mockAuth.mockReset();
  mockAuth.mockResolvedValue(null as any);
});

describe('GET /api/events', () => {
  it('returns an empty list when no events exist', async () => {
    const req = new NextRequest('http://localhost:3000/api/events');
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.events).toEqual([]);
    expect(body.pagination.total).toBe(0);
  });

  it('returns a list of events', async () => {
    await seedTestData({
      events: [
        { ...testEvent, name: 'Event A' },
        { ...testEvent, name: 'Event B', landingPage: { ...testEvent.landingPage, slug: 'event-b' } },
      ],
    });

    const req = new NextRequest('http://localhost:3000/api/events');
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.events).toHaveLength(2);
    expect(body.pagination.total).toBe(2);
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.limit).toBe(10);
  });

  it('supports pagination with page and limit query params', async () => {
    const events = Array.from({ length: 5 }, (_, i) => ({
      ...testEvent,
      name: `Event ${i}`,
      landingPage: { ...testEvent.landingPage, slug: `event-${i}` },
    }));
    await seedTestData({ events });

    const req = new NextRequest('http://localhost:3000/api/events?page=2&limit=2');
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.events).toHaveLength(2);
    expect(body.pagination.page).toBe(2);
    expect(body.pagination.limit).toBe(2);
    expect(body.pagination.total).toBe(5);
    expect(body.pagination.totalPages).toBe(3);
  });

  it('filters events by status', async () => {
    await seedTestData({
      events: [
        { ...testEvent, name: 'Open Event', status: 'open', landingPage: { ...testEvent.landingPage, slug: 'open-event' } },
        { ...testEvent, name: 'Draft Event', status: 'draft', landingPage: { ...testEvent.landingPage, slug: 'draft-event' } },
      ],
    });

    const req = new NextRequest('http://localhost:3000/api/events?status=open');
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.events).toHaveLength(1);
    expect(body.events[0].name).toBe('Open Event');
  });

  it('includes isRegistered=false when unauthenticated', async () => {
    await seedTestData({ events: [testEvent] });

    const req = new NextRequest('http://localhost:3000/api/events');
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.events[0].isRegistered).toBe(false);
  });
});

describe('POST /api/events', () => {
  const validEventData = {
    name: 'New Hackathon',
    description: 'A great hackathon for testing event creation flow',
    theme: 'AI Innovation',
    startDate: '2026-06-01T09:00:00.000Z',
    endDate: '2026-06-03T18:00:00.000Z',
    registrationDeadline: '2026-05-25T23:59:59.000Z',
    location: 'Test City Convention Center',
    capacity: 200,
    isVirtual: false,
    tags: ['AI', 'ML'],
  };

  it('returns 401 when not authenticated', async () => {
    const req = new NextRequest('http://localhost:3000/api/events', {
      method: 'POST',
      body: JSON.stringify(validEventData),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 403 when role is participant', async () => {
    const { users } = await seedTestData({ users: [testUsers.participant1] });
    mockAuth.mockResolvedValue({
      user: { id: users[0]._id.toString(), role: 'participant', name: 'Participant', email: 'participant1@test.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any);

    const req = new NextRequest('http://localhost:3000/api/events', {
      method: 'POST',
      body: JSON.stringify(validEventData),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe('Forbidden: insufficient permissions');
  });

  it('returns 422 with invalid event data', async () => {
    const { users } = await seedTestData({ users: [testUsers.admin] });
    mockAuth.mockResolvedValue({
      user: { id: users[0]._id.toString(), role: 'admin', name: 'Admin', email: 'admin@test.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any);

    const req = new NextRequest('http://localhost:3000/api/events', {
      method: 'POST',
      body: JSON.stringify({ name: 'AB' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(req);
    expect(response.status).toBe(422);
  });

  it('successfully creates event with admin role', async () => {
    const { users } = await seedTestData({ users: [testUsers.admin] });
    const userId = users[0]._id.toString();
    mockAuth.mockResolvedValue({
      user: { id: userId, role: 'admin', name: 'Admin', email: 'admin@test.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any);

    const req = new NextRequest('http://localhost:3000/api/events', {
      method: 'POST',
      body: JSON.stringify(validEventData),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.name).toBe('New Hackathon');
    expect(body.status).toBe('draft');
    expect(body.organizers).toContain(userId);
  });

  it('successfully creates event with organizer role', async () => {
    const { users } = await seedTestData({
      users: [{ ...testUsers.admin, email: 'organizer@test.com', role: 'organizer', name: 'Organizer' }],
    });
    const userId = users[0]._id.toString();
    mockAuth.mockResolvedValue({
      user: { id: userId, role: 'organizer', name: 'Organizer', email: 'organizer@test.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any);

    const req = new NextRequest('http://localhost:3000/api/events', {
      method: 'POST',
      body: JSON.stringify(validEventData),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.organizers).toContain(userId);
  });

  it('auto-populates organizer as current user', async () => {
    const { users } = await seedTestData({
      users: [{ ...testUsers.admin, email: 'auto-org@test.com' }],
    });
    const userId = users[0]._id.toString();
    mockAuth.mockResolvedValue({
      user: { id: userId, role: 'admin', name: 'Admin', email: 'auto-org@test.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any);

    const req = new NextRequest('http://localhost:3000/api/events', {
      method: 'POST',
      body: JSON.stringify(validEventData),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.organizers).toHaveLength(1);
    expect(body.organizers[0]).toBe(userId);
  });
});
