# Salesforce Integration Plan - MongoHacks Platform

## Overview

Integrate Salesforce CRM to match hackathon participants with existing customers, enabling:
- Automatic participant enrichment with Salesforce customer data
- Contact/Lead creation for new participants
- Event attendance tracking in Salesforce
- Marketing campaign attribution

---

## Use Case: Participant-Customer Matching

**Goal:** When a participant registers, look them up in Salesforce by email and enrich their profile with customer data.

**Benefits:**
- Know which customers are engaging with hackathons
- Track customer lifecycle (prospect → customer → advocate)
- Measure ROI of developer relations activities
- Personalize hackathon experience for existing customers

---

## Salesforce API Options

### 1. REST API (Recommended)
**Best for:** Real-time lookups, CRUD operations, modern integrations

**Key Endpoints:**
```
GET /services/data/v59.0/query/?q=SELECT+Id,Name,Email+FROM+Contact+WHERE+Email='user@example.com'
GET /services/data/v59.0/sobjects/Contact/{id}
POST /services/data/v59.0/sobjects/Contact
PATCH /services/data/v59.0/sobjects/Contact/{id}
```

**Pros:**
- Simple HTTP/JSON
- Excellent documentation
- Rate limits (15,000 API calls/day for Enterprise edition)
- Modern authentication (OAuth 2.0)

**Cons:**
- Rate limits on high-volume operations
- Requires OAuth flow setup

### 2. SOQL (Salesforce Object Query Language)
**Best for:** Complex queries, filtering, relationships

**Example:**
```sql
SELECT Id, Name, Email, AccountId, Account.Name, 
       Title, Phone, Department, MailingCity
FROM Contact 
WHERE Email = 'john.doe@mongodb.com'
LIMIT 1
```

**Pros:**
- SQL-like syntax (familiar)
- Can join related objects (Account, Opportunity, etc.)
- Efficient for complex queries

### 3. Bulk API 2.0
**Best for:** Large data imports/exports (>2,000 records)

**Use Cases:**
- Initial migration of historical participants
- Nightly batch sync
- Mass updates

**Pros:**
- Process millions of records
- Asynchronous (submit job, poll for results)
- Doesn't count against API rate limits

**Cons:**
- More complex to implement
- Not suitable for real-time lookups

---

## Authentication Methods

### Option 1: OAuth 2.0 Server-to-Server (Recommended)
**Best for:** Backend API integration (our use case)

**Flow:**
1. Create Connected App in Salesforce
2. Generate client credentials (Client ID, Client Secret)
3. Request access token via OAuth 2.0 JWT Bearer flow
4. Use token for API requests (valid for ~2 hours)
5. Refresh token when expired

**Setup Steps:**
```bash
# 1. In Salesforce Setup → App Manager → New Connected App
#    - Enable OAuth Settings
#    - Callback URL: https://login.salesforce.com/services/oauth2/callback
#    - Scopes: api, refresh_token, offline_access
#    - Enable "Use digital signatures" (upload certificate)

# 2. Get access token (JWT Bearer Flow)
POST https://login.salesforce.com/services/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer
&assertion=<JWT_TOKEN>
```

**Security:**
- Store Client ID/Secret in environment variables
- Use TLS for all requests
- Implement token caching (avoid repeated auth calls)

### Option 2: Named Credentials (for Admins)
**Best for:** Salesforce Flows/Apex calling external APIs (reverse direction)

Not applicable for our Node.js → Salesforce integration.

---

## Architecture Options

### Approach A: Real-Time Lookup (Recommended)
**When:** Participant registers → immediately query Salesforce

```
User Submits Registration
         ↓
    Next.js API Route
         ↓
  POST /api/register
         ↓
    ┌─────────────────┐
    │ 1. Validate     │
    │ 2. Query SF     │ ← Salesforce REST API
    │ 3. Enrich data  │
    │ 4. Save to DB   │
    └─────────────────┘
         ↓
   Return response
```

**Pros:**
- Immediate data enrichment
- Users see relevant messaging (e.g., "Welcome back, John!")
- Accurate real-time status

**Cons:**
- Adds latency to registration (200-500ms per SF call)
- Dependent on Salesforce uptime
- Uses API quota

**Mitigation:**
- Implement timeout (max 3 seconds)
- Fallback: save participant without enrichment, enrich async
- Cache Salesforce results (15-minute TTL)

### Approach B: Async Background Sync
**When:** Registration saves immediately → background job enriches later

```
User Submits Registration
         ↓
    Save to MongoDB
         ↓
    Queue enrichment job
         ↓
   Return response (fast!)

Meanwhile...
    Background Worker
         ↓
    Query Salesforce
         ↓
    Update participant record
```

**Pros:**
- Fast registration UX (no waiting)
- Resilient to Salesforce outages
- Can batch multiple lookups

**Cons:**
- Data not immediately available
- More complex (need job queue)
- Potential for stale data

**Implementation:**
- Use BullMQ or similar job queue
- Process in batches every 5 minutes
- Retry failed lookups (exponential backoff)

### Approach C: Hybrid (Best of Both)
**When:** Try real-time, fallback to async

```javascript
async function registerParticipant(data) {
  // Save participant first (fast)
  const participant = await ParticipantModel.create(data);
  
  try {
    // Try real-time enrichment (with timeout)
    const sfData = await querySalesforce(data.email, { timeout: 2000 });
    if (sfData) {
      await participant.updateOne({ salesforceData: sfData });
    }
  } catch (err) {
    // Failed? Queue for background enrichment
    await enrichmentQueue.add({ participantId: participant._id });
  }
  
  return participant;
}
```

---

## Data Mapping Strategy

### Salesforce Objects to Query

**1. Contact (Primary)**
```javascript
{
  salesforce: {
    contactId: "0033h00000ABC123",
    accountId: "0013h00000XYZ456",
    accountName: "MongoDB Inc.",
    title: "Senior Developer",
    phone: "+1-555-0100",
    mailingCity: "New York",
    department: "Engineering",
    ownerId: "0053h00000DEF789",
    ownerName: "Jane Sales",
    leadSource: "Hackathon",
    
    // Custom fields (if you have them)
    customerTier__c: "Enterprise",
    lastEngagementDate__c: "2026-02-15",
    preferredLanguage__c: "JavaScript",
  }
}
```

**2. Lead (if Contact not found)**
- For prospects who haven't converted yet
- Different field names (Company instead of Account)

**3. Campaign Members**
- Track who attended which events
- Measure campaign ROI

### MongoDB Participant Schema Update

```typescript
// src/lib/db/models/Participant.ts

interface IParticipant extends Document {
  // ... existing fields ...
  
  salesforce?: {
    contactId?: string;
    leadId?: string;
    accountId?: string;
    accountName?: string;
    
    // Enrichment data
    title?: string;
    company?: string; // From Account or Lead.Company
    phone?: string;
    city?: string;
    
    // Metadata
    lastSyncedAt?: Date;
    syncStatus?: "pending" | "synced" | "not_found" | "error";
    syncError?: string;
    
    // Campaign tracking
    campaignMemberId?: string;
  };
  
  // Custom fields from Salesforce
  customerTier?: "enterprise" | "growth" | "startup" | "community";
  isExistingCustomer?: boolean;
}
```

---

## Implementation Plan

### Phase 1: Foundation (Week 1)
**Goal:** Establish Salesforce connectivity

**Tasks:**
1. ✅ Create Salesforce Developer/Sandbox account (if needed)
2. ✅ Set up Connected App in Salesforce
   - Generate OAuth credentials
   - Configure certificate for JWT flow
3. ✅ Install Salesforce SDK: `npm install jsforce`
4. ✅ Create `/lib/salesforce/client.ts` wrapper
5. ✅ Test authentication and basic query
6. ✅ Store credentials in `.env.local`

**Deliverable:** Working Salesforce API client

### Phase 2: Participant Enrichment (Week 2)
**Goal:** Enrich participants on registration

**Tasks:**
1. ✅ Update Participant model schema (add salesforce fields)
2. ✅ Create `/lib/salesforce/queries.ts` (SOQL helpers)
3. ✅ Implement lookup function: `findContactByEmail(email)`
4. ✅ Update registration API: `/api/register`
   - Call Salesforce lookup
   - Merge SF data into participant record
5. ✅ Add admin UI to view SF enrichment status
6. ✅ Handle edge cases:
   - Multiple contacts with same email (choose primary)
   - Contact not found (create Lead?)
   - Salesforce timeout/error (graceful degradation)

**Deliverable:** Registration enriches with Salesforce data

### Phase 3: Bi-Directional Sync (Week 3)
**Goal:** Write data back to Salesforce

**Tasks:**
1. ✅ Create Campaign in Salesforce for each hackathon event
2. ✅ Add participants as Campaign Members
3. ✅ Update Contact with participation data:
   - Last hackathon attended
   - Skills gained
   - Projects submitted
4. ✅ Optionally create new Leads for unknown participants

**Deliverable:** Salesforce reflects hackathon participation

### Phase 4: Background Jobs (Week 4)
**Goal:** Reliable async processing

**Tasks:**
1. ✅ Set up BullMQ job queue
2. ✅ Create enrichment worker
3. ✅ Retry logic for failed syncs
4. ✅ Admin UI to view sync status and retry failures
5. ✅ Monitoring/alerting for sync failures

**Deliverable:** Production-ready sync system

---

## Code Examples

### 1. Salesforce Client (`/lib/salesforce/client.ts`)

```typescript
import jsforce from 'jsforce';

let connection: jsforce.Connection | null = null;

export async function getSalesforceConnection() {
  if (connection) {
    // Reuse existing connection
    return connection;
  }

  const { SF_LOGIN_URL, SF_USERNAME, SF_PASSWORD, SF_SECURITY_TOKEN } = process.env;

  if (!SF_LOGIN_URL || !SF_USERNAME || !SF_PASSWORD) {
    throw new Error("Salesforce credentials not configured");
  }

  connection = new jsforce.Connection({
    loginUrl: SF_LOGIN_URL, // https://login.salesforce.com or https://test.salesforce.com
  });

  await connection.login(SF_USERNAME, SF_PASSWORD + SF_SECURITY_TOKEN);

  console.log("✅ Connected to Salesforce as:", SF_USERNAME);
  
  return connection;
}

export async function querySalesforce<T = any>(soql: string): Promise<T[]> {
  const conn = await getSalesforceConnection();
  const result = await conn.query<T>(soql);
  return result.records;
}
```

### 2. Contact Lookup (`/lib/salesforce/queries.ts`)

```typescript
import { querySalesforce } from './client';

interface SalesforceContact {
  Id: string;
  Name: string;
  Email: string;
  AccountId?: string;
  Account?: {
    Name: string;
  };
  Title?: string;
  Phone?: string;
  MailingCity?: string;
  Department?: string;
}

export async function findContactByEmail(email: string): Promise<SalesforceContact | null> {
  const soql = `
    SELECT Id, Name, Email, AccountId, Account.Name, 
           Title, Phone, MailingCity, Department
    FROM Contact 
    WHERE Email = '${email.replace(/'/g, "\\'")}'
    LIMIT 1
  `;

  const results = await querySalesforce<SalesforceContact>(soql);
  
  return results.length > 0 ? results[0] : null;
}

export async function findLeadByEmail(email: string) {
  const soql = `
    SELECT Id, Name, Email, Company, Title, Phone, City, Status
    FROM Lead 
    WHERE Email = '${email.replace(/'/g, "\\'")}'
    AND IsConverted = false
    LIMIT 1
  `;

  const results = await querySalesforce(soql);
  return results.length > 0 ? results[0] : null;
}

export async function createCampaignMember(campaignId: string, contactId: string) {
  const conn = await getSalesforceConnection();
  
  return conn.sobject('CampaignMember').create({
    CampaignId: campaignId,
    ContactId: contactId,
    Status: 'Registered', // or 'Attended' after event
  });
}
```

### 3. Registration API Update

```typescript
// /app/api/register/route.ts

import { findContactByEmail, findLeadByEmail } from '@/lib/salesforce/queries';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, name, skills } = body;

  // 1. Validate registration data
  // ...

  // 2. Try Salesforce enrichment (with timeout)
  let salesforceData = null;
  try {
    const contact = await Promise.race([
      findContactByEmail(email),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
    ]);

    if (contact) {
      salesforceData = {
        contactId: contact.Id,
        accountId: contact.AccountId,
        accountName: contact.Account?.Name,
        title: contact.Title,
        phone: contact.Phone,
        city: contact.MailingCity,
        isExistingCustomer: true,
        lastSyncedAt: new Date(),
        syncStatus: 'synced',
      };
    } else {
      // Try Lead
      const lead = await findLeadByEmail(email);
      if (lead) {
        salesforceData = {
          leadId: lead.Id,
          company: lead.Company,
          title: lead.Title,
          isExistingCustomer: false,
          lastSyncedAt: new Date(),
          syncStatus: 'synced',
        };
      }
    }
  } catch (err) {
    console.warn('Salesforce lookup failed:', err);
    // Continue without enrichment
  }

  // 3. Create participant with enriched data
  const participant = await ParticipantModel.create({
    name,
    email,
    skills,
    salesforce: salesforceData || { syncStatus: 'not_found' },
  });

  return NextResponse.json({ success: true, participant });
}
```

---

## Environment Variables

```bash
# .env.local

# Salesforce Connection (Username/Password flow)
SF_LOGIN_URL=https://login.salesforce.com
SF_USERNAME=integration@yourcompany.com
SF_PASSWORD=YourPassword123
SF_SECURITY_TOKEN=AbCdEfGhIjKlMnOpQrSt

# OR Salesforce OAuth (JWT Bearer flow - more secure)
SF_CLIENT_ID=3MVG9...
SF_CLIENT_SECRET=1234567890ABCDEF
SF_PRIVATE_KEY_PATH=./salesforce-private-key.pem
SF_USERNAME=integration@yourcompany.com

# Campaign IDs (map event to Salesforce Campaign)
SF_CAMPAIGN_SPRING_2026=7013h000000ABC123
SF_CAMPAIGN_AI_2026=7013h000000DEF456
```

---

## Security Considerations

### 1. API Key Storage
- ✅ Never commit credentials to Git
- ✅ Use environment variables
- ✅ Rotate credentials quarterly
- ✅ Use dedicated "integration user" (not personal account)

### 2. Data Privacy
- ✅ Only sync necessary fields (GDPR/CCPA compliance)
- ✅ Get consent before creating Salesforce records
- ✅ Allow participants to opt-out of sync
- ✅ Implement data deletion in both systems

### 3. Rate Limiting
- ✅ Cache Salesforce results (15-minute TTL)
- ✅ Batch operations when possible
- ✅ Monitor API usage (Salesforce limits: 15K calls/day)
- ✅ Implement exponential backoff on errors

### 4. Error Handling
- ✅ Never fail registration due to Salesforce errors
- ✅ Log all sync failures for manual review
- ✅ Retry transient errors (3 attempts)
- ✅ Alert admins on persistent failures

---

## Testing Strategy

### 1. Salesforce Sandbox
- Use test.salesforce.com for development
- Separate sandbox for staging
- Production credentials only in prod environment

### 2. Mock Responses
```typescript
// __tests__/salesforce.test.ts
import { findContactByEmail } from '@/lib/salesforce/queries';

jest.mock('@/lib/salesforce/client', () => ({
  querySalesforce: jest.fn(() => Promise.resolve([
    {
      Id: '0033h00000ABC123',
      Name: 'Test User',
      Email: 'test@example.com',
      Account: { Name: 'Test Company' },
    },
  ])),
}));

test('findContactByEmail returns contact', async () => {
  const contact = await findContactByEmail('test@example.com');
  expect(contact).toBeDefined();
  expect(contact?.Name).toBe('Test User');
});
```

### 3. Integration Tests
- Test against Salesforce sandbox with known test data
- Verify SOQL queries return expected fields
- Test error scenarios (network timeout, invalid credentials)

---

## Admin UI Requirements

### 1. Salesforce Sync Status Dashboard
**Location:** `/admin/salesforce`

**Features:**
- Total participants synced vs. not synced
- Recent sync errors (with retry button)
- API usage quota (calls remaining today)
- Last successful sync timestamp
- Manual re-sync button for all participants

### 2. Participant Detail View
**Location:** `/admin/participants/[id]`

**Show:**
- Salesforce Contact/Lead link (if synced)
- Account name and tier (if customer)
- Sync status badge (synced, pending, error)
- Manual "Sync Now" button
- Sync history log (timestamp, status, error message)

---

## Monitoring & Alerts

### Key Metrics
- **Sync success rate:** Target >95%
- **API call volume:** Stay under 80% of daily limit
- **Average lookup latency:** <500ms
- **Error rate:** <5%

### Alerting Rules
- Alert if sync failures >10 in 1 hour
- Alert if API quota >90% used
- Alert if Salesforce connection fails 3 times
- Weekly report: sync stats, top errors, API usage trend

---

## Cost Estimation

### Salesforce API Limits (Enterprise Edition)
- **Daily API calls:** 15,000
- **Concurrent requests:** 25
- **Storage:** 120 MB per Salesforce license

### Expected Usage (MongoHacks)
- **Registrations:** ~50/event × 10 events/year = 500
- **API calls per registration:** 2 (Contact lookup + Campaign Member creation)
- **Total calls:** 1,000/year = ~3 calls/day
- **Batch sync (optional):** 500 calls/month = ~17/day

**Conclusion:** Well under API limits. No additional cost.

---

## Recommended Path Forward

### Immediate Next Steps (This Week)

1. **Decision:** Real-time vs. Async enrichment?
   - Recommend: **Hybrid** (try real-time, fallback to async)

2. **Set up Salesforce:**
   - Get credentials from your Salesforce admin
   - Create Connected App
   - Test connection with Postman/curl

3. **Prototype:**
   - Install `jsforce`: `npm install jsforce`
   - Create basic client in `/lib/salesforce/client.ts`
   - Test one lookup manually

4. **Review:**
   - Show me results, adjust plan based on findings

### Questions to Clarify

1. **Do you have a Salesforce org?**
   - If not: need to set up trial/sandbox first

2. **What Salesforce edition?** (affects API limits)
   - Professional, Enterprise, Unlimited?

3. **Existing Salesforce setup?**
   - Do you already have Campaigns for events?
   - Any custom fields we should populate?

4. **Who manages Salesforce?**
   - Need their help for Connected App setup

5. **Bi-directional sync needed?**
   - Just read from SF? Or write back participation data?

---

## Resources

### Documentation
- [Salesforce REST API Guide](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/)
- [jsforce Library](https://jsforce.github.io/)
- [OAuth 2.0 JWT Bearer Flow](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_jwt_flow.htm)

### Tools
- [Salesforce Workbench](https://workbench.developerforce.com/) - Test SOQL queries
- [Postman Salesforce Collection](https://www.postman.com/salesforce-developers/workspace/salesforce-developers/)

### Community
- [Salesforce Stack Exchange](https://salesforce.stackexchange.com/)
- [Trailblazer Community](https://trailblazers.salesforce.com/)

---

## Next: Let's Discuss

I've outlined three approaches and a phased implementation plan. Before proceeding:

1. **Confirm access:** Do you have Salesforce credentials?
2. **Clarify scope:** Just enrichment, or bi-directional sync?
3. **Choose approach:** Real-time, async, or hybrid?

Once we decide, I can start building the integration code.
