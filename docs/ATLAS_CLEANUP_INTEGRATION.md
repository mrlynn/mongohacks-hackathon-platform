# Atlas Cluster Auto-Cleanup Integration Guide

## Overview

When an event concludes, the platform can automatically delete all provisioned Atlas clusters for that event to prevent resource waste and reduce costs.

## How It Works

1. **Event Configuration**: Each event has an `atlasProvisioning.autoCleanupOnEventEnd` flag
2. **Status Transition**: When event status changes to `concluded`, cleanup triggers
3. **Deletion**: All active clusters for that event are deleted via Atlas Admin API
4. **Reporting**: Cleanup results are logged

## Integration Points

### 1. Automatic Cleanup (Recommended)

**When:** Event status changes to `concluded`

**Where to add:** In your event update API route (`/api/admin/events/[eventId]`)

```typescript
import { handleEventStatusChange } from '@/lib/atlas/event-lifecycle-hook';

// In your PATCH/PUT handler:
export async function PATCH(req: NextRequest, { params }: { params: { eventId: string } }) {
  // ... existing code ...
  
  const oldStatus = event.status;
  
  // Update event
  event.status = body.status;
  await event.save();
  
  // Trigger cleanup if status changed to concluded
  await handleEventStatusChange(params.eventId, oldStatus, event.status);
  
  // ... rest of handler ...
}
```

### 2. Manual Cleanup (Admin Dashboard)

**Location:** `/admin/atlas`

**Actions:**
- **Preview Cleanup**: See which events have clusters pending deletion
- **Run Cleanup Now**: Manually trigger cleanup for all concluded events

**API:**
```bash
# Preview (GET)
GET /api/atlas/admin/cleanup

# Execute (POST)
POST /api/atlas/admin/cleanup
Body: { "eventId": "optional-specific-event-id" }
```

### 3. Scheduled Cleanup (Cron)

**Frequency:** Daily (recommended)

**Setup with OpenClaw cron or external scheduler:**

```typescript
import { runScheduledCleanup } from '@/lib/atlas/cleanup-service';

// Run daily cleanup
const reports = await runScheduledCleanup();

// Log results
console.log(`Cleanup completed: ${reports.length} events processed`);
```

**Cron expression:** `0 2 * * *` (2 AM daily)

## Event Configuration

To enable auto-cleanup for an event:

```typescript
const event = await EventModel.create({
  name: 'Hackathon 2026',
  // ... other fields ...
  atlasProvisioning: {
    enabled: true,
    autoCleanupOnEventEnd: true, // ← Enable auto-cleanup
    defaultProvider: 'AWS',
    defaultRegion: 'US_EAST_1',
    // ... other config ...
  },
});
```

## Cleanup Behavior

### What Gets Deleted

- **Atlas Project**: Entire Atlas project is deleted (contains cluster, users, access lists)
- **Database Users**: All users scoped to the cluster
- **IP Access List**: All access list entries
- **Platform Record**: Status updated to `deleted`

### What Doesn't Get Deleted

- **Project data in platform**: Project, Team, Event records remain intact
- **User accounts**: Team member accounts are not affected
- **Event data**: Event record and metadata preserved

### Safety Guards

- **Opt-in**: Only events with `autoCleanupOnEventEnd: true` are affected
- **Status check**: Only deletes clusters for events with `status: 'concluded'`
- **Skip already deleted**: Won't re-delete clusters already marked as deleted
- **Error handling**: Failures logged, but don't block other clusters

## Monitoring

### Logs

Cleanup actions are logged with prefix `[Atlas Cleanup]`:

```
[Atlas Cleanup] Event "Hackathon 2026" concluded, cleaning up 5 clusters
[Atlas Cleanup] Deleted cluster 507f1f77bcf86cd799439011 (hackathon-cluster)
[Atlas Cleanup] Event "Hackathon 2026" cleanup complete: 5/5 deleted
```

### Cleanup Reports

API responses include detailed reports:

```json
{
  "success": true,
  "eventsProcessed": 1,
  "totals": {
    "clustersFound": 5,
    "clustersDeleted": 5,
    "errors": 0
  },
  "reports": [
    {
      "eventId": "507f1f77bcf86cd799439011",
      "eventName": "Hackathon 2026",
      "clustersFound": 5,
      "clustersDeleted": 5,
      "errors": []
    }
  ]
}
```

## Error Handling

If cluster deletion fails:
- Error is logged
- Other clusters continue processing
- Platform record status set to `error`
- Error message stored in cluster record

Admins can retry failed deletions via:
1. Force delete in admin UI (`/admin/atlas`)
2. Manual cleanup API call for specific event
3. Direct Atlas console access

## Testing

### Test Cleanup Flow

1. **Create test event** with auto-cleanup enabled
2. **Provision cluster** for a test team
3. **Change event status** to `concluded`
4. **Verify cleanup**: Check logs and platform records

### Dry Run

Preview cleanup without deleting:

```bash
POST /api/atlas/admin/cleanup
Body: { "dryRun": true }
```

## FAQ

**Q: What if I want to keep clusters after event ends?**  
A: Set `atlasProvisioning.autoCleanupOnEventEnd: false` for that event.

**Q: Can I recover deleted clusters?**  
A: No, Atlas cluster deletion is permanent. Back up data before event concludes.

**Q: What happens if cleanup fails?**  
A: The cluster status is set to `error` with details. Admins can retry via admin UI.

**Q: Can I cleanup a single event manually?**  
A: Yes, via admin UI or API: `POST /api/atlas/admin/cleanup { "eventId": "..." }`

**Q: Do I need Atlas credentials for cleanup?**  
A: Yes, cleanup uses the same Atlas Admin API credentials as provisioning.

## Next Steps

- [x] Automatic cleanup on event conclude
- [ ] Email notifications to team leaders before cleanup
- [ ] Grace period (e.g., delete 7 days after event ends)
- [ ] Cluster backup/export before deletion
- [ ] Analytics on cluster usage during event
