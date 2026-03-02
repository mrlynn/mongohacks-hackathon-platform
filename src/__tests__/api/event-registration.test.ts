import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { setupTestDB, teardownTestDB, clearCollections, seedTestData } from '../utils/db';
import { testUsers } from '../fixtures/users';
import { testEvent, closedEvent } from '../fixtures/events';

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
jest.mock('@/lib/notifications/notification-service', () => ({
  notifyRegistrationConfirmed: jest.fn(),
}));
jest.mock('@/lib/email/email-service', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/lib/email/template-renderer', () => ({
  renderEmailTemplate: jest.fn().mockResolvedValue({
    subject: 'Test Subject',
    html: '<p>Test</p>',
    text: 'Test',
  }),
}));

import { auth } from '@/lib/auth';
const mockAuth = auth as jest.Mock;

// Import route AFTER mocking
import { POST } from '@/app/api/events/[eventId]/register/route';

describe('POST /api/events/[eventId]/register', () => {
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

  const validRegistration = {
    name: 'New User',
    email: 'newuser@test.com',
    password: 'securepassword123',
    skills: ['JavaScript', 'React'],
  };

  it('returns 404 when event not found', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const req = new NextRequest(`http://localhost:3000/api/events/${fakeId}/register`, {
      method: 'POST',
      body: JSON.stringify(validRegistration),
      headers: { 'Content-Type': 'application/json' },
    });
    const ctx = { params: Promise.resolve({ eventId: fakeId }) };
    const response = await POST(req, ctx);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe('Event not found');
  });

  it('returns 400 when event status is draft', async () => {
    const { events } = await seedTestData({
      events: [{ ...testEvent, status: 'draft', landingPage: { ...testEvent.landingPage, slug: 'draft-event-reg' } }],
    });
    const eventId = events[0]._id.toString();

    const req = new NextRequest(`http://localhost:3000/api/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify(validRegistration),
      headers: { 'Content-Type': 'application/json' },
    });
    const ctx = { params: Promise.resolve({ eventId }) };
    const response = await POST(req, ctx);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('This event is not yet open for registration');
  });

  it('returns 400 when event status is concluded', async () => {
    const { events } = await seedTestData({
      events: [{ ...closedEvent, landingPage: { ...closedEvent.landingPage, slug: 'concluded-reg' } }],
    });
    const eventId = events[0]._id.toString();

    const req = new NextRequest(`http://localhost:3000/api/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify(validRegistration),
      headers: { 'Content-Type': 'application/json' },
    });
    const ctx = { params: Promise.resolve({ eventId }) };
    const response = await POST(req, ctx);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('This event is no longer accepting registrations');
  });

  it('returns 400 when registration deadline has passed', async () => {
    const { events } = await seedTestData({
      events: [{
        ...testEvent,
        status: 'open',
        registrationDeadline: new Date('2020-01-01T00:00:00Z'),
        landingPage: { ...testEvent.landingPage, slug: 'past-deadline-reg' },
      }],
    });
    const eventId = events[0]._id.toString();

    const req = new NextRequest(`http://localhost:3000/api/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify(validRegistration),
      headers: { 'Content-Type': 'application/json' },
    });
    const ctx = { params: Promise.resolve({ eventId }) };
    const response = await POST(req, ctx);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Registration deadline has passed');
  });

  it('returns 400 for validation errors (missing skills)', async () => {
    const { events } = await seedTestData({
      events: [{ ...testEvent, landingPage: { ...testEvent.landingPage, slug: 'validation-reg' } }],
    });
    const eventId = events[0]._id.toString();

    const req = new NextRequest(`http://localhost:3000/api/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify({ name: 'X', email: 'bad' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const ctx = { params: Promise.resolve({ eventId }) };
    const response = await POST(req, ctx);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Validation failed');
    expect(body.details).toBeDefined();
  });

  it('successfully registers an existing authenticated user for an event', async () => {
    // Use the existing-user path (no transaction needed) to avoid MongoMemoryServer replica set limitation
    const { events, users } = await seedTestData({
      events: [{
        ...testEvent,
        registrationDeadline: new Date('2027-12-31T23:59:59Z'),
        landingPage: { ...testEvent.landingPage, slug: 'success-reg' },
      }],
      users: [{
        email: 'registered-user@test.com',
        name: 'Registered User',
        passwordHash: testUsers.participant1.passwordHash,
        role: 'participant',
      }],
    });
    const eventId = events[0]._id.toString();
    const userId = users[0]._id.toString();

    // Simulate authenticated session so the existing-user path is used
    mockAuth.mockResolvedValue({
      user: { id: userId, role: 'participant', name: 'Registered User', email: 'registered-user@test.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any);

    const req = new NextRequest(`http://localhost:3000/api/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'Registered User',
        email: 'registered-user@test.com',
        skills: ['JavaScript', 'React'],
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const ctx = { params: Promise.resolve({ eventId }) };
    const response = await POST(req, ctx);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe('Successfully registered for the event!');
    expect(body.data.eventId).toBe(eventId);
    expect(body.data.isNewUser).toBe(false);
  });

  it('returns 400 for duplicate registration', async () => {
    const { events } = await seedTestData({
      events: [{
        ...testEvent,
        registrationDeadline: new Date('2027-12-31T23:59:59Z'),
        landingPage: { ...testEvent.landingPage, slug: 'dup-reg' },
      }],
      users: [{ ...testUsers.participant1, emailVerified: true }],
    });
    const eventId = events[0]._id.toString();

    // First, create a participant already registered
    const { users } = await seedTestData({
      users: [{
        email: 'existing-dup@test.com',
        name: 'Existing Dup',
        passwordHash: testUsers.participant1.passwordHash,
        role: 'participant',
      }],
    });

    await seedTestData({
      participants: [{
        userId: users[0]._id,
        email: 'existing-dup@test.com',
        name: 'Existing Dup',
        skills: ['JavaScript'],
        registeredEvents: [{ eventId: events[0]._id, registrationDate: new Date(), status: 'registered' }],
      }],
    });

    // Simulate the user being authenticated
    mockAuth.mockResolvedValue({
      user: { id: users[0]._id.toString(), role: 'participant', name: 'Existing Dup', email: 'existing-dup@test.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any);

    const req = new NextRequest(`http://localhost:3000/api/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'Existing Dup',
        email: 'existing-dup@test.com',
        skills: ['JavaScript'],
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const ctx = { params: Promise.resolve({ eventId }) };
    const response = await POST(req, ctx);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('You are already registered for this event');
  });
});
