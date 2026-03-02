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
jest.mock('@/lib/ai/embedding-service', () => ({
  generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
}));

import { auth } from '@/lib/auth';
const mockAuth = auth as jest.Mock;

// Import route AFTER mocking
import { GET, POST } from '@/app/api/events/[eventId]/teams/route';

describe('GET /api/events/[eventId]/teams', () => {
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

  it('returns empty array when no teams exist', async () => {
    const { events } = await seedTestData({ events: [testEvent] });
    const eventId = events[0]._id.toString();

    const req = new NextRequest(`http://localhost:3000/api/events/${eventId}/teams`);
    const ctx = { params: Promise.resolve({ eventId }) };
    const response = await GET(req, ctx);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.teams).toEqual([]);
  });

  it('returns teams for an event', async () => {
    const { events, users } = await seedTestData({
      events: [testEvent],
      users: [{ ...testUsers.participant1, emailVerified: true }],
    });
    const eventId = events[0]._id.toString();
    const userId = users[0]._id;

    await seedTestData({
      teams: [
        {
          name: 'Team Alpha',
          eventId: events[0]._id,
          leaderId: userId,
          members: [userId],
          status: 'forming',
        },
      ],
    });

    const req = new NextRequest(`http://localhost:3000/api/events/${eventId}/teams`);
    const ctx = { params: Promise.resolve({ eventId }) };
    const response = await GET(req, ctx);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.teams).toHaveLength(1);
    expect(body.teams[0].name).toBe('Team Alpha');
  });
});

describe('POST /api/events/[eventId]/teams', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearCollections();
    mockAuth.mockReset();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null as any);

    const { events } = await seedTestData({ events: [testEvent] });
    const eventId = events[0]._id.toString();

    const req = new NextRequest(`http://localhost:3000/api/events/${eventId}/teams`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Team Test' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const ctx = { params: Promise.resolve({ eventId }) };
    const response = await POST(req, ctx);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 403 when email is not verified', async () => {
    const { events, users } = await seedTestData({
      events: [testEvent],
      users: [{ ...testUsers.participant1, emailVerified: false }],
    });
    const eventId = events[0]._id.toString();
    const userId = users[0]._id.toString();

    mockAuth.mockResolvedValue({
      user: { id: userId, role: 'participant', name: 'Participant', email: 'participant1@test.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any);

    const req = new NextRequest(`http://localhost:3000/api/events/${eventId}/teams`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Team Test' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const ctx = { params: Promise.resolve({ eventId }) };
    const response = await POST(req, ctx);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe('Please verify your email address before creating teams');
    expect(body.code).toBe('EMAIL_NOT_VERIFIED');
  });

  it('successfully creates team with current user as leader', async () => {
    const { events, users } = await seedTestData({
      events: [testEvent],
      users: [{ ...testUsers.participant1, emailVerified: true }],
    });
    const eventId = events[0]._id.toString();
    const userId = users[0]._id.toString();

    // Also create participant record so the update at the end works
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

    const req = new NextRequest(`http://localhost:3000/api/events/${eventId}/teams`, {
      method: 'POST',
      body: JSON.stringify({ name: 'My Team', description: 'We build cool stuff', desiredSkills: ['React', 'Node'] }),
      headers: { 'Content-Type': 'application/json' },
    });
    const ctx = { params: Promise.resolve({ eventId }) };
    const response = await POST(req, ctx);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.team.name).toBe('My Team');
    expect(body.team.leaderId).toBe(userId);
    expect(body.team.members).toContain(userId);
    expect(body.team.status).toBe('forming');
  });

  it('prevents creating a second team in the same event', async () => {
    const { events, users } = await seedTestData({
      events: [testEvent],
      users: [{ ...testUsers.participant1, emailVerified: true }],
    });
    const eventId = events[0]._id.toString();
    const userId = users[0]._id.toString();

    // Create an existing team
    await seedTestData({
      teams: [
        {
          name: 'Existing Team',
          eventId: events[0]._id,
          leaderId: users[0]._id,
          members: [users[0]._id],
          status: 'forming',
        },
      ],
    });

    mockAuth.mockResolvedValue({
      user: { id: userId, role: 'participant', name: 'Participant', email: 'participant1@test.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any);

    const req = new NextRequest(`http://localhost:3000/api/events/${eventId}/teams`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Second Team' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const ctx = { params: Promise.resolve({ eventId }) };
    const response = await POST(req, ctx);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('You are already in a team for this event');
  });
});
