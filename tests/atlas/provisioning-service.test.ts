/**
 * Unit tests for Atlas cluster provisioning service
 */

import { provisionCluster, deleteCluster, ConflictError } from '@/lib/atlas/provisioning-service';
import { AtlasClusterModel } from '@/lib/db/models/AtlasCluster';
import { EventModel } from '@/lib/db/models/Event';
import * as atlasClient from '@/lib/atlas/atlas-client';
import { mockEvent, mockTeam, mockProject, mockUser, mockAtlasProject, mockAtlasCluster, createTestCluster } from './setup';

jest.mock('@/lib/atlas/atlas-client');
jest.mock('@/lib/db/models/AtlasCluster');
jest.mock('@/lib/db/models/Event');
jest.mock('@/lib/db/connection', () => ({
  connectToDatabase: jest.fn(),
}));

describe('Provisioning Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('provisionCluster', () => {
    it('should successfully provision a new cluster', async () => {
      // Mock event with provisioning enabled
      (EventModel.findById as jest.Mock).mockResolvedValue(mockEvent);

      // Mock no existing cluster
      (AtlasClusterModel.findOne as jest.Mock).mockResolvedValue(null);

      // Mock Atlas API responses
      (atlasClient.createAtlasProject as jest.Mock).mockResolvedValue(mockAtlasProject);
      (atlasClient.createM0Cluster as jest.Mock).mockResolvedValue(mockAtlasCluster);
      (atlasClient.createAtlasDatabaseUser as jest.Mock).mockResolvedValue({ username: 'team-def456' });
      (atlasClient.addIpAccessListEntries as jest.Mock).mockResolvedValue(undefined);

      // Mock database save
      const mockSave = jest.fn().mockResolvedValue(createTestCluster());
      (AtlasClusterModel.create as jest.Mock).mockResolvedValue({
        ...createTestCluster(),
        toObject: () => createTestCluster(),
      });

      const result = await provisionCluster({
        eventId: mockEvent._id.toString(),
        teamId: mockTeam._id.toString(),
        projectId: mockProject._id.toString(),
        userId: mockUser._id.toString(),
      });

      expect(result).toBeDefined();
      expect(result._initialCredentials).toBeDefined();
      expect(result._initialCredentials?.username).toContain('team-');
      expect(atlasClient.createAtlasProject).toHaveBeenCalled();
      expect(atlasClient.createM0Cluster).toHaveBeenCalled();
      expect(atlasClient.createAtlasDatabaseUser).toHaveBeenCalled();
    });

    it('should throw ConflictError if cluster already exists', async () => {
      (EventModel.findById as jest.Mock).mockResolvedValue(mockEvent);
      (AtlasClusterModel.findOne as jest.Mock).mockResolvedValue(createTestCluster());

      await expect(
        provisionCluster({
          eventId: mockEvent._id.toString(),
          teamId: mockTeam._id.toString(),
          projectId: mockProject._id.toString(),
          userId: mockUser._id.toString(),
        })
      ).rejects.toThrow(ConflictError);
    });

    it('should throw error if event provisioning is disabled', async () => {
      const disabledEvent = {
        ...mockEvent,
        atlasProvisioning: { ...mockEvent.atlasProvisioning, enabled: false },
      };
      (EventModel.findById as jest.Mock).mockResolvedValue(disabledEvent);

      await expect(
        provisionCluster({
          eventId: mockEvent._id.toString(),
          teamId: mockTeam._id.toString(),
          projectId: mockProject._id.toString(),
          userId: mockUser._id.toString(),
        })
      ).rejects.toThrow('Atlas cluster provisioning is not enabled');
    });

    it('should rollback on cluster creation failure', async () => {
      (EventModel.findById as jest.Mock).mockResolvedValue(mockEvent);
      (AtlasClusterModel.findOne as jest.Mock).mockResolvedValue(null);
      (atlasClient.createAtlasProject as jest.Mock).mockResolvedValue(mockAtlasProject);
      (atlasClient.createM0Cluster as jest.Mock).mockRejectedValue(new Error('Cluster creation failed'));
      (atlasClient.deleteAtlasProject as jest.Mock).mockResolvedValue(undefined);

      await expect(
        provisionCluster({
          eventId: mockEvent._id.toString(),
          teamId: mockTeam._id.toString(),
          projectId: mockProject._id.toString(),
          userId: mockUser._id.toString(),
        })
      ).rejects.toThrow('Cluster creation failed');

      // Verify rollback was attempted
      expect(atlasClient.deleteAtlasProject).toHaveBeenCalledWith(mockAtlasProject.id);
    });
  });

  describe('deleteCluster', () => {
    it('should successfully delete a cluster', async () => {
      const cluster = createTestCluster();
      const mockSave = jest.fn().mockResolvedValue(cluster);
      cluster.save = mockSave;

      (AtlasClusterModel.findById as jest.Mock).mockResolvedValue(cluster);
      (atlasClient.deleteAtlasProject as jest.Mock).mockResolvedValue(undefined);

      await deleteCluster(cluster._id.toString());

      expect(atlasClient.deleteAtlasProject).toHaveBeenCalledWith(cluster.atlasProjectId);
      expect(mockSave).toHaveBeenCalled();
      expect(cluster.status).toBe('deleted');
    });

    it('should handle deletion errors gracefully', async () => {
      const cluster = createTestCluster();
      const mockSave = jest.fn().mockResolvedValue(cluster);
      cluster.save = mockSave;

      (AtlasClusterModel.findById as jest.Mock).mockResolvedValue(cluster);
      (atlasClient.deleteAtlasProject as jest.Mock).mockRejectedValue(new Error('Atlas API error'));

      await expect(deleteCluster(cluster._id.toString())).rejects.toThrow('Atlas API error');

      expect(cluster.status).toBe('error');
      expect(cluster.errorMessage).toContain('Deletion failed');
    });

    it('should skip deletion if already deleted', async () => {
      const cluster = createTestCluster({ status: 'deleted' });
      (AtlasClusterModel.findById as jest.Mock).mockResolvedValue(cluster);

      await deleteCluster(cluster._id.toString());

      expect(atlasClient.deleteAtlasProject).not.toHaveBeenCalled();
    });

    it('should throw error if cluster not found', async () => {
      (AtlasClusterModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(deleteCluster('nonexistent-id')).rejects.toThrow('Cluster not found');
    });
  });
});
