import { Types } from 'mongoose';

/**
 * Test helpers and mocks for Atlas cluster provisioning tests.
 */

export const mockAtlasCredentials = {
  ATLAS_PUBLIC_KEY: 'test-public-key',
  ATLAS_PRIVATE_KEY: 'test-private-key',
  ATLAS_ORG_ID: 'test-org-id',
  ATLAS_BASE_URL: 'https://test.mongodb.com/api/atlas/v2',
};

export const mockEvent = {
  _id: new Types.ObjectId(),
  name: 'Test Hackathon 2026',
  status: 'open',
  atlasProvisioning: {
    enabled: true,
    defaultProvider: 'AWS',
    defaultRegion: 'US_EAST_1',
    openNetworkAccess: true,
    maxDbUsersPerCluster: 5,
    autoCleanupOnEventEnd: true,
    allowedProviders: ['AWS', 'GCP', 'AZURE'],
    allowedRegions: ['US_EAST_1', 'EU_WEST_1'],
  },
};

export const mockTeam = {
  _id: new Types.ObjectId(),
  name: 'Test Team',
  leader: new Types.ObjectId(),
  members: [new Types.ObjectId()],
  event: mockEvent._id,
};

export const mockProject = {
  _id: new Types.ObjectId(),
  name: 'Test Project',
  team: mockTeam._id,
  event: mockEvent._id,
};

export const mockUser = {
  _id: new Types.ObjectId(),
  name: 'Test User',
  email: 'test@example.com',
  role: 'participant',
};

export const mockAtlasProject = {
  id: '507f1f77bcf86cd799439011',
  name: 'mh-abc123-def456',
  orgId: mockAtlasCredentials.ATLAS_ORG_ID,
  created: new Date().toISOString(),
};

export const mockAtlasCluster = {
  id: '507f1f77bcf86cd799439012',
  name: 'hackathon-cluster',
  clusterType: 'REPLICASET',
  stateName: 'IDLE',
  mongoDBVersion: '7.0.5',
  connectionStrings: {
    standardSrv: 'mongodb+srv://cluster.example.mongodb.net',
    standard: 'mongodb://cluster.example.mongodb.net:27017',
  },
  providerSettings: {
    providerName: 'TENANT',
    regionName: 'US_EAST_1',
    instanceSizeName: 'M0',
  },
};

export const mockDbUser = {
  username: 'test-user',
  databaseName: 'admin',
  roles: [{ roleName: 'readWriteAnyDatabase', databaseName: 'admin' }],
  scopes: [{ name: 'hackathon-cluster', type: 'CLUSTER' }],
};

export const mockIpAccessEntry = {
  cidrBlock: '0.0.0.0/0',
  comment: 'Hackathon open access',
};

/**
 * Mock fetch responses for Atlas Admin API
 */
export function mockAtlasFetch(responses: Record<string, any>) {
  const originalFetch = global.fetch;

  global.fetch = jest.fn((url: string, options?: any) => {
    const method = options?.method || 'GET';
    const key = `${method} ${url}`;

    if (responses[key]) {
      const response = responses[key];
      return Promise.resolve({
        ok: response.ok !== false,
        status: response.status || 200,
        json: () => Promise.resolve(response.data),
      } as Response);
    }

    // Default 404
    return Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Not found' }),
    } as Response);
  }) as jest.Mock;

  return () => {
    global.fetch = originalFetch;
  };
}

/**
 * Generate test cluster document
 */
export function createTestCluster(overrides: Partial<any> = {}) {
  return {
    _id: new Types.ObjectId(),
    eventId: mockEvent._id,
    teamId: mockTeam._id,
    projectId: mockProject._id,
    provisionedBy: mockUser._id,
    atlasProjectId: mockAtlasProject.id,
    atlasProjectName: mockAtlasProject.name,
    atlasClusterName: mockAtlasCluster.name,
    atlasClusterId: mockAtlasCluster.id,
    connectionString: mockAtlasCluster.connectionStrings.standardSrv,
    standardConnectionString: mockAtlasCluster.connectionStrings.standard,
    databaseUsers: [],
    ipAccessList: [],
    status: 'active',
    providerName: 'AWS',
    regionName: 'US_EAST_1',
    mongoDBVersion: '7.0.5',
    lastStatusCheck: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Wait for async operations
 */
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
