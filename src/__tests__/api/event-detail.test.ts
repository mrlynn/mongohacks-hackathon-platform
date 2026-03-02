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
import { GET } from '@/app/api/events/[eventId]/route';

describe('GET /api/events/[eventId]', () => {
  beforeAll(async () => {
    await setupTestDB();
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

  it('returns event details for a valid eventId', async () => {
    const { events } = await seedTestData({ events: [testEvent] });
    const eventId = events[0]._id.toString();

    const req = new NextRequest(`http://localhost:3000/api/events/${eventId}`);
    const ctx = { params: Promise.resolve({ eventId }) };
    const response = await GET(req, ctx);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.event).toBeDefined();
    expect(body.event.name).toBe(testEvent.name);
    expect(body.stats).toBeDefined();
    expect(body.stats.registered).toBe(0);
    expect(body.stats.capacity).toBe(testEvent.capacity);
    expect(body.isRegistered).toBe(false);
  });

  it('returns 404 for a non-existent eventId', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const req = new NextRequest(`http://localhost:3000/api/events/${fakeId}`);
    const ctx = { params: Promise.resolve({ eventId: fakeId }) };
    const response = await GET(req, ctx);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe('Event not found');
  });

  it('returns 400 for an invalid eventId format', async () => {
    const req = new NextRequest('http://localhost:3000/api/events/not-a-valid-id');
    const ctx = { params: Promise.resolve({ eventId: 'not-a-valid-id' }) };
    const response = await GET(req, ctx);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Invalid event ID format');
  });

  it('returns isRegistered=true when current user is registered', async () => {
    const { events, users } = await seedTestData({
      events: [testEvent],
      users: [testUsers.participant1],
    });
    const eventId = events[0]._id.toString();
    const userId = users[0]._id.toString();

    // Create participant record for this user
    await seedTestData({
      participants: [
        {
          userId: users[0]._id,
          email: testUsers.participant1.email,
          name: testUsers.participant1.name,
          skills: ['JavaScript'],
          registeredEvents: [{ eventId: events[0]._id, registrationDate: new Date(), status: 'registered' }],
        },
      ],
    });

    mockAuth.mockResolvedValue({
      user: { id: userId, role: 'participant', name: 'Participant', email: 'participant1@test.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any);

    const req = new NextRequest(`http://localhost:3000/api/events/${eventId}`);
    const ctx = { params: Promise.resolve({ eventId }) };
    const response = await GET(req, ctx);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.isRegistered).toBe(true);
    expect(body.stats.registered).toBe(1);
  });

  it('returns correct spotsRemaining and stats', async () => {
    const { events, users } = await seedTestData({
      events: [{ ...testEvent, capacity: 2 }],
      users: [testUsers.participant1, testUsers.participant2],
    });
    const eventId = events[0]._id.toString();

    // Register two participants
    await seedTestData({
      participants: [
        {
          userId: users[0]._id,
          email: testUsers.participant1.email,
          name: testUsers.participant1.name,
          skills: ['JS'],
          registeredEvents: [{ eventId: events[0]._id, registrationDate: new Date(), status: 'registered' }],
        },
        {
          userId: users[1]._id,
          email: testUsers.participant2.email,
          name: testUsers.participant2.name,
          skills: ['Python'],
          registeredEvents: [{ eventId: events[0]._id, registrationDate: new Date(), status: 'registered' }],
        },
      ],
    });

    const req = new NextRequest(`http://localhost:3000/api/events/${eventId}`);
    const ctx = { params: Promise.resolve({ eventId }) };
    const response = await GET(req, ctx);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.stats.registered).toBe(2);
    expect(body.stats.capacity).toBe(2);
    expect(body.stats.spotsRemaining).toBe(0);
    expect(body.stats.percentFull).toBe(100);
  });
});
