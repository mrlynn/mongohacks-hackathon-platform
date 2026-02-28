/**
 * Unit tests for Atlas cluster cleanup service
 */

import {
  cleanupEventClusters,
  findEventsNeedingCleanup,
  runScheduledCleanup,
} from '@/lib/atlas/cleanup-service';
import { EventModel } from '@/lib/db/models/Event';
import { AtlasClusterModel } from '@/lib/db/models/AtlasCluster';
import { deleteCluster } from '@/lib/atlas/provisioning-service';
import { mockEvent, createTestCluster } from './setup';

jest.mock('@/lib/db/models/Event');
jest.mock('@/lib/db/models/AtlasCluster');
jest.mock('@/lib/atlas/provisioning-service');
jest.mock('@/lib/db/connection', () => ({
  connectToDatabase: jest.fn(),
}));

describe('Cleanup Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cleanupEventClusters', () => {
    it('should cleanup all clusters for an event', async () => {
      const event = { ...mockEvent, status: 'concluded' };
      (EventModel.findById as jest.Mock).mockResolvedValue(event);

      const clusters = [
        createTestCluster({ status: 'active' }),
        createTestCluster({ status: 'active' }),
        createTestCluster({ status: 'active' }),
      ];
      (AtlasClusterModel.find as jest.Mock).mockResolvedValue(clusters);
      (deleteCluster as jest.Mock).mockResolvedValue(undefined);

      const report = await cleanupEventClusters(mockEvent._id.toString());

      expect(report.clustersFound).toBe(3);
      expect(report.clustersDeleted).toBe(3);
      expect(report.errors).toHaveLength(0);
      expect(deleteCluster).toHaveBeenCalledTimes(3);
    });

    it('should skip cleanup if autoCleanupOnEventEnd is disabled', async () => {
      const event = {
        ...mockEvent,
        atlasProvisioning: { ...mockEvent.atlasProvisioning, autoCleanupOnEventEnd: false },
      };
      (EventModel.findById as jest.Mock).mockResolvedValue(event);

      const report = await cleanupEventClusters(mockEvent._id.toString());

      expect(report.clustersFound).toBe(0);
      expect(report.clustersDeleted).toBe(0);
      expect(AtlasClusterModel.find).not.toHaveBeenCalled();
    });

    it('should handle cleanup errors gracefully', async () => {
      const event = { ...mockEvent, status: 'concluded' };
      (EventModel.findById as jest.Mock).mockResolvedValue(event);

      const clusters = [
        createTestCluster({ _id: 'cluster-1', status: 'active' }),
        createTestCluster({ _id: 'cluster-2', status: 'active' }),
      ];
      (AtlasClusterModel.find as jest.Mock).mockResolvedValue(clusters);
      
      // First cluster succeeds, second fails
      (deleteCluster as jest.Mock)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Deletion failed'));

      const report = await cleanupEventClusters(mockEvent._id.toString());

      expect(report.clustersFound).toBe(2);
      expect(report.clustersDeleted).toBe(1);
      expect(report.errors).toHaveLength(1);
      expect(report.errors[0].error).toContain('Deletion failed');
    });

    it('should throw error if event not found', async () => {
      (EventModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(cleanupEventClusters('nonexistent-id')).rejects.toThrow('Event not found');
    });
  });

  describe('findEventsNeedingCleanup', () => {
    it('should find concluded events with active clusters', async () => {
      const concludedEvents = [
        { _id: 'event-1' },
        { _id: 'event-2' },
        { _id: 'event-3' },
      ];
      (EventModel.find as jest.Mock).mockResolvedValue(concludedEvents);

      // event-1 has 2 active clusters, event-2 has 0, event-3 has 1
      (AtlasClusterModel.countDocuments as jest.Mock)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(1);

      const eventIds = await findEventsNeedingCleanup();

      expect(eventIds).toEqual(['event-1', 'event-3']);
    });

    it('should return empty array if no events need cleanup', async () => {
      (EventModel.find as jest.Mock).mockResolvedValue([]);

      const eventIds = await findEventsNeedingCleanup();

      expect(eventIds).toEqual([]);
    });
  });

  describe('runScheduledCleanup', () => {
    it('should cleanup multiple events', async () => {
      const eventIds = ['event-1', 'event-2'];
      jest.spyOn(require('@/lib/atlas/cleanup-service'), 'findEventsNeedingCleanup')
        .mockResolvedValue(eventIds);

      const event1 = { ...mockEvent, _id: 'event-1', name: 'Event 1' };
      const event2 = { ...mockEvent, _id: 'event-2', name: 'Event 2' };

      (EventModel.findById as jest.Mock)
        .mockResolvedValueOnce(event1)
        .mockResolvedValueOnce(event2);

      (AtlasClusterModel.find as jest.Mock)
        .mockResolvedValueOnce([createTestCluster()])
        .mockResolvedValueOnce([createTestCluster(), createTestCluster()]);

      (deleteCluster as jest.Mock).mockResolvedValue(undefined);

      const reports = await runScheduledCleanup();

      expect(reports).toHaveLength(2);
      expect(reports[0].eventName).toBe('Event 1');
      expect(reports[0].clustersDeleted).toBe(1);
      expect(reports[1].eventName).toBe('Event 2');
      expect(reports[1].clustersDeleted).toBe(2);
    });

    it('should return empty array if no events need cleanup', async () => {
      jest.spyOn(require('@/lib/atlas/cleanup-service'), 'findEventsNeedingCleanup')
        .mockResolvedValue([]);

      const reports = await runScheduledCleanup();

      expect(reports).toEqual([]);
    });

    it('should continue cleanup if one event fails', async () => {
      const eventIds = ['event-1', 'event-2'];
      jest.spyOn(require('@/lib/atlas/cleanup-service'), 'findEventsNeedingCleanup')
        .mockResolvedValue(eventIds);

      (EventModel.findById as jest.Mock)
        .mockRejectedValueOnce(new Error('Event 1 error'))
        .mockResolvedValueOnce({ ...mockEvent, _id: 'event-2', name: 'Event 2' });

      (AtlasClusterModel.find as jest.Mock).mockResolvedValue([createTestCluster()]);
      (deleteCluster as jest.Mock).mockResolvedValue(undefined);

      const reports = await runScheduledCleanup();

      // Only event-2 should have a report (event-1 failed)
      expect(reports).toHaveLength(1);
      expect(reports[0].eventName).toBe('Event 2');
    });
  });
});
