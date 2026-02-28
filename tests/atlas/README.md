# Atlas Cluster Provisioning - Testing Guide

## Overview

This directory contains comprehensive tests for the Atlas cluster provisioning feature.

## Test Structure

```
tests/atlas/
├── setup.ts                      # Test helpers and mocks
├── atlas-client.test.ts          # Atlas Admin API client tests
├── provisioning-service.test.ts  # Provisioning service tests
├── cleanup-service.test.ts       # Cleanup service tests
├── e2e-scenarios.test.ts         # E2E workflow tests
└── README.md                     # This file
```

## Running Tests

### Unit Tests

```bash
# Run all Atlas tests
npm test -- tests/atlas

# Run specific test file
npm test -- tests/atlas/atlas-client.test.ts

# Run with coverage
npm test -- --coverage tests/atlas
```

### E2E Tests

E2E tests require a real MongoDB Atlas organization with API credentials.

**⚠️ Warning:** E2E tests will create and delete real Atlas resources. Use a dedicated test organization.

```bash
# Set up test credentials
export ATLAS_TEST_ORG_ID="your-test-org-id"
export ATLAS_TEST_PUBLIC_KEY="your-test-public-key"
export ATLAS_TEST_PRIVATE_KEY="your-test-private-key"

# Run E2E tests
npm test -- tests/atlas/e2e-scenarios.test.ts
```

## Test Coverage

### Atlas Client (`atlas-client.test.ts`)

**Project Operations:**
- ✅ Create Atlas project
- ✅ Delete Atlas project
- ✅ Handle project creation errors

**Cluster Operations:**
- ✅ Create M0 cluster
- ✅ Get cluster details
- ✅ Delete cluster
- ✅ Handle cluster errors

**Database User Operations:**
- ✅ Create database user
- ✅ List database users
- ✅ Delete database user

**IP Access List Operations:**
- ✅ Add IP access entries
- ✅ List IP access entries
- ✅ Remove IP access entry

### Provisioning Service (`provisioning-service.test.ts`)

**Provision Cluster:**
- ✅ Successfully provision new cluster
- ✅ Throw ConflictError if cluster exists
- ✅ Throw error if provisioning disabled
- ✅ Rollback on cluster creation failure

**Delete Cluster:**
- ✅ Successfully delete cluster
- ✅ Handle deletion errors gracefully
- ✅ Skip deletion if already deleted
- ✅ Throw error if cluster not found

### Cleanup Service (`cleanup-service.test.ts`)

**Cleanup Event Clusters:**
- ✅ Cleanup all clusters for an event
- ✅ Skip cleanup if autoCleanupOnEventEnd disabled
- ✅ Handle cleanup errors gracefully
- ✅ Throw error if event not found

**Find Events Needing Cleanup:**
- ✅ Find concluded events with active clusters
- ✅ Return empty array if no events need cleanup

**Run Scheduled Cleanup:**
- ✅ Cleanup multiple events
- ✅ Return empty array if no events need cleanup
- ✅ Continue cleanup if one event fails

### E2E Scenarios (`e2e-scenarios.test.ts`)

**Team Leader Workflow:**
- ⏳ Complete full cluster lifecycle
- ⏳ Prevent duplicate cluster provisioning
- ⏳ Enforce max database users limit

**Team Member Workflow:**
- ⏳ Allow viewing but not provisioning

**Admin Workflow:**
- ⏳ Manage all clusters across events

**Event Cleanup Workflow:**
- ⏳ Auto-cleanup when event concludes
- ⏳ Skip cleanup if disabled

**Error Handling Workflow:**
- ⏳ Handle Atlas API failures gracefully
- ⏳ Handle cleanup failures gracefully

## Test Helpers

### `setup.ts` Utilities

**Mock Data:**
- `mockAtlasCredentials` - Test Atlas API credentials
- `mockEvent` - Test event with provisioning enabled
- `mockTeam`, `mockProject`, `mockUser` - Test entities
- `mockAtlasProject`, `mockAtlasCluster` - Mock Atlas API responses
- `mockDbUser`, `mockIpAccessEntry` - Mock resource responses

**Helper Functions:**
- `mockAtlasFetch(responses)` - Mock fetch for Atlas API calls
- `createTestCluster(overrides)` - Generate test cluster documents
- `delay(ms)` - Wait for async operations

## Manual Testing Checklist

### Team Leader Flow

- [ ] Navigate to `/teams/{teamId}/atlas` as team leader
- [ ] See empty state with "Provision Free Cluster" button
- [ ] Click provision button
- [ ] Fill out wizard (select AWS, US_EAST_1)
- [ ] Click "Provision Cluster"
- [ ] See credentials dialog with username + password
- [ ] Copy credentials to clipboard
- [ ] Click "Done"
- [ ] See cluster dashboard with "creating" status
- [ ] Wait 5-10 minutes for provisioning
- [ ] Status changes to "active"
- [ ] Connection string becomes available
- [ ] Create additional database user
- [ ] Verify password is shown once
- [ ] Add IP access entry (0.0.0.0/0)
- [ ] Delete cluster
- [ ] Confirm deletion dialog
- [ ] Status changes to "deleting" then "deleted"

### Team Member Flow

- [ ] Navigate to `/teams/{teamId}/atlas` as team member (not leader)
- [ ] See cluster dashboard (read-only)
- [ ] Verify "Provision" button is hidden
- [ ] Verify "Delete" button is hidden
- [ ] Verify "Add User" button is hidden
- [ ] Verify "Add IP" button is hidden
- [ ] Can view connection strings
- [ ] Can view database users
- [ ] Can view IP access list

### Admin Flow

- [ ] Navigate to `/admin/atlas` as admin
- [ ] See table of all clusters
- [ ] Filter by status (active, creating, etc.)
- [ ] Filter by event ID
- [ ] Click "Preview Cleanup"
- [ ] See list of events needing cleanup
- [ ] Close preview
- [ ] Click "Run Cleanup Now"
- [ ] Confirm action
- [ ] See cleanup results dialog
- [ ] Verify stats (clusters found/deleted/errors)
- [ ] Force delete a specific cluster
- [ ] Confirm deletion
- [ ] Verify cluster is deleted

### Event Cleanup Flow

- [ ] Create test event with `autoCleanupOnEventEnd: true`
- [ ] Provision clusters for test teams
- [ ] Change event status to "concluded"
- [ ] Verify cleanup triggers automatically
- [ ] Check logs for cleanup messages
- [ ] Verify clusters transition to "deleting"
- [ ] Verify clusters marked as "deleted"
- [ ] Check cleanup report in logs

### Error Handling

- [ ] Attempt to provision without Atlas credentials
- [ ] Verify friendly error message
- [ ] Attempt to provision duplicate cluster
- [ ] Verify "already exists" error
- [ ] Attempt to create 6th database user
- [ ] Verify "maximum 5 users" error
- [ ] Attempt to add 21st IP access entry
- [ ] Verify "maximum 20 entries" error
- [ ] Simulate Atlas API failure (network disconnect)
- [ ] Verify rollback occurs
- [ ] Verify error status and message saved

## Known Issues

None at this time.

## Contributing

When adding new features:

1. Add unit tests for all new services
2. Add integration tests for all new API routes
3. Update E2E scenarios if user workflow changes
4. Update manual testing checklist
5. Run full test suite before committing

## Test Data Cleanup

After running tests, clean up any test resources:

```bash
# Clean up test database
npm run db:clean:test

# Clean up Atlas test resources (if E2E tests ran)
# Manually delete test projects from Atlas console
```

## CI/CD Integration

Tests are run automatically on:
- Every pull request
- Every commit to main branch
- Scheduled nightly runs (E2E tests)

See `.github/workflows/test-atlas.yml` for CI configuration.
