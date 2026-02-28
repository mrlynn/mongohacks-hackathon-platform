/**
 * Unit tests for Atlas Admin API client
 */

import {
  createAtlasProject,
  deleteAtlasProject,
  createM0Cluster,
  getAtlasCluster,
  deleteAtlasCluster,
  createAtlasDatabaseUser,
  deleteAtlasDatabaseUser,
  listAtlasDatabaseUsers,
  addIpAccessListEntries,
  removeIpAccessListEntry,
  listIpAccessList,
  AtlasApiError,
} from '@/lib/atlas/atlas-client';
import { mockAtlasFetch, mockAtlasProject, mockAtlasCluster, mockDbUser } from './setup';

describe('Atlas Client', () => {
  describe('Project Operations', () => {
    it('should create an Atlas project', async () => {
      const cleanup = mockAtlasFetch({
        'POST https://test.mongodb.com/api/atlas/v2/groups': {
          data: mockAtlasProject,
        },
      });

      const project = await createAtlasProject('test-project');

      expect(project.id).toBe(mockAtlasProject.id);
      expect(project.name).toBe(mockAtlasProject.name);

      cleanup();
    });

    it('should delete an Atlas project', async () => {
      const cleanup = mockAtlasFetch({
        'DELETE https://test.mongodb.com/api/atlas/v2/groups/507f1f77bcf86cd799439011': {
          status: 204,
          data: undefined,
        },
      });

      await expect(deleteAtlasProject('507f1f77bcf86cd799439011')).resolves.toBeUndefined();

      cleanup();
    });

    it('should throw AtlasApiError on project creation failure', async () => {
      const cleanup = mockAtlasFetch({
        'POST https://test.mongodb.com/api/atlas/v2/groups': {
          ok: false,
          status: 400,
          data: { errorCode: 'DUPLICATE_PROJECT', detail: 'Project already exists' },
        },
      });

      await expect(createAtlasProject('duplicate-project')).rejects.toThrow(AtlasApiError);

      cleanup();
    });
  });

  describe('Cluster Operations', () => {
    it('should create an M0 cluster', async () => {
      const cleanup = mockAtlasFetch({
        'POST https://test.mongodb.com/api/atlas/v2/groups/507f1f77bcf86cd799439011/clusters': {
          data: mockAtlasCluster,
        },
      });

      const cluster = await createM0Cluster('507f1f77bcf86cd799439011', {
        name: 'test-cluster',
        backingProvider: 'AWS',
        region: 'US_EAST_1',
      });

      expect(cluster.name).toBe('hackathon-cluster');
      expect(cluster.stateName).toBe('IDLE');

      cleanup();
    });

    it('should get cluster details', async () => {
      const cleanup = mockAtlasFetch({
        'GET https://test.mongodb.com/api/atlas/v2/groups/507f1f77bcf86cd799439011/clusters/test-cluster': {
          data: mockAtlasCluster,
        },
      });

      const cluster = await getAtlasCluster('507f1f77bcf86cd799439011', 'test-cluster');

      expect(cluster.name).toBe('hackathon-cluster');
      expect(cluster.connectionStrings?.standardSrv).toBeDefined();

      cleanup();
    });

    it('should delete a cluster', async () => {
      const cleanup = mockAtlasFetch({
        'DELETE https://test.mongodb.com/api/atlas/v2/groups/507f1f77bcf86cd799439011/clusters/test-cluster': {
          status: 204,
          data: undefined,
        },
      });

      await expect(
        deleteAtlasCluster('507f1f77bcf86cd799439011', 'test-cluster')
      ).resolves.toBeUndefined();

      cleanup();
    });
  });

  describe('Database User Operations', () => {
    it('should create a database user', async () => {
      const cleanup = mockAtlasFetch({
        'POST https://test.mongodb.com/api/atlas/v2/groups/507f1f77bcf86cd799439011/databaseUsers': {
          data: mockDbUser,
        },
      });

      const user = await createAtlasDatabaseUser('507f1f77bcf86cd799439011', {
        username: 'test-user',
        password: 'test-password',
        clusterName: 'test-cluster',
      });

      expect(user.username).toBe('test-user');
      expect(user.scopes).toBeDefined();

      cleanup();
    });

    it('should list database users', async () => {
      const cleanup = mockAtlasFetch({
        'GET https://test.mongodb.com/api/atlas/v2/groups/507f1f77bcf86cd799439011/databaseUsers': {
          data: { results: [mockDbUser] },
        },
      });

      const users = await listAtlasDatabaseUsers('507f1f77bcf86cd799439011');

      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('test-user');

      cleanup();
    });

    it('should delete a database user', async () => {
      const cleanup = mockAtlasFetch({
        'DELETE https://test.mongodb.com/api/atlas/v2/groups/507f1f77bcf86cd799439011/databaseUsers/admin/test-user': {
          status: 204,
          data: undefined,
        },
      });

      await expect(
        deleteAtlasDatabaseUser('507f1f77bcf86cd799439011', 'test-user')
      ).resolves.toBeUndefined();

      cleanup();
    });
  });

  describe('IP Access List Operations', () => {
    it('should add IP access list entries', async () => {
      const cleanup = mockAtlasFetch({
        'POST https://test.mongodb.com/api/atlas/v2/groups/507f1f77bcf86cd799439011/accessList': {
          status: 201,
          data: undefined,
        },
      });

      await expect(
        addIpAccessListEntries('507f1f77bcf86cd799439011', [
          { cidrBlock: '0.0.0.0/0', comment: 'Test access' },
        ])
      ).resolves.toBeUndefined();

      cleanup();
    });

    it('should list IP access entries', async () => {
      const cleanup = mockAtlasFetch({
        'GET https://test.mongodb.com/api/atlas/v2/groups/507f1f77bcf86cd799439011/accessList': {
          data: { results: [{ cidrBlock: '0.0.0.0/0', comment: 'Test access' }] },
        },
      });

      const entries = await listIpAccessList('507f1f77bcf86cd799439011');

      expect(entries).toHaveLength(1);
      expect(entries[0].cidrBlock).toBe('0.0.0.0/0');

      cleanup();
    });

    it('should remove an IP access entry', async () => {
      const cleanup = mockAtlasFetch({
        'DELETE https://test.mongodb.com/api/atlas/v2/groups/507f1f77bcf86cd799439011/accessList/0.0.0.0%2F0': {
          status: 204,
          data: undefined,
        },
      });

      await expect(
        removeIpAccessListEntry('507f1f77bcf86cd799439011', '0.0.0.0/0')
      ).resolves.toBeUndefined();

      cleanup();
    });
  });
});
