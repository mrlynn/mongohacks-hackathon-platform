# RAG Chat Prioritization System

This document explains how the MongoHacks RAG chat system prioritizes user-facing UI documentation over technical API reference material.

## Three-Layer Prioritization

The RAG system uses a **three-layer approach** to ensure users get relevant, actionable guidance instead of technical API documentation:

### 1. **Retrieval Layer** (Vector Search + Boosting)
📍 **File:** `src/lib/rag/retrieval.ts`

Documents are retrieved using MongoDB Atlas Vector Search, then re-ranked with category-based score boosting:

```typescript
Category Boost Multipliers:
├─ Admin guides        → 1.5x  (highest)
├─ Getting Started     → 1.4x
├─ Features            → 1.2x
├─ AI features         → 1.1x
├─ General docs        → 1.0x  (baseline)
└─ API reference       → 0.3x  (lowest)
```

**Smart API Detection:**
- Checks query for keywords: `api`, `endpoint`, `route`, `rest`, `http`, `post`, `get`, `put`, `delete`, `integration`
- If **API query detected**: Normal boost (0.3x)
- If **NOT API query**: Extra penalty (0.15x) to suppress API docs

**Example:**
```javascript
Query: "how to create event"
Vector Search Results (before boosting):
  1. POST /api/events [API]     - score: 0.92
  2. Admin Event Creation Guide - score: 0.89
  3. Event Management Features  - score: 0.85

After Category Boosting:
  1. Admin Event Creation Guide - score: 1.34 (0.89 * 1.5)
  2. Event Management Features  - score: 1.02 (0.85 * 1.2)
  3. POST /api/events [API]     - score: 0.14 (0.92 * 0.15) ← suppressed
```

### 2. **Chat Prompt Layer** (System Instructions)
📍 **File:** `src/lib/rag/chat.ts`

GPT-4o receives explicit instructions to prefer UI documentation:

**Authenticated Users:**
```
- **Prioritize user-facing UI documentation over API reference docs**:
  * Favor guides for Admin, Getting Started, Features, and AI features
  * Only cite API documentation when the user explicitly asks about 
    "API", "endpoint", "route", or technical integration
  * When both UI and API docs are available, prefer the UI explanation
```

**Anonymous Users:**
```
- **Prioritize user-facing content over technical API docs**:
  * Focus on how-to guides, getting started tutorials, and feature explanations
  * Only mention API endpoints if the user specifically asks about technical integration
  * Explain features from a user's perspective, not a developer's
```

### 3. **Search Layer** (Algolia DocSearch)
📍 **File:** `docs/mongohacks-docs/algolia-crawler-config.json`

Algolia search uses `page_rank` values to prioritize results:

```json
Admin guides       → page_rank: 15
Getting Started    → page_rank: 14
Features           → page_rank: 12
AI features        → page_rank: 11
General docs       → page_rank: 10
API reference      → page_rank: 3
```

See `docs/mongohacks-docs/ALGOLIA_SETUP.md` for full search configuration.

---

## How Prioritization Works

### Scenario 1: User Asks About Features

**Query:** "How does team formation work?"

**Retrieval Layer:**
1. Vector search finds relevant docs
2. Category boosting applied:
   - `/docs/features/teams` (Features category) → 1.2x boost
   - `/api/events/[eventId]/teams` (API category) → 0.15x penalty
3. Results re-sorted by boosted scores

**Chat Prompt Layer:**
4. GPT-4o receives system instructions to prefer user guides
5. Response focuses on how users create/join teams via UI
6. API endpoints only mentioned if user asks "how do I integrate teams API?"

**Search Layer:**
7. Algolia search (if user searches docs) shows Features (rank 12) before API (rank 3)

---

### Scenario 2: User Explicitly Asks About API

**Query:** "What's the API endpoint for creating events?"

**Retrieval Layer:**
1. API query detected (keyword: "API", "endpoint")
2. API docs get normal boost (0.3x, not extra penalty)
3. Still lower than UI docs, but not suppressed

**Chat Prompt Layer:**
4. GPT-4o sees user explicitly asked about API
5. Response provides API documentation
6. May also suggest UI-based alternatives

**Search Layer:**
7. Algolia `contextualSearch: true` boosts API results when query contains "api"

---

## Priority Ranking Summary

| Category         | Retrieval Boost | Algolia Rank | Use Case                          |
|------------------|----------------|--------------|-----------------------------------|
| Admin Guides     | 1.5x           | 15           | Platform administration, setup    |
| Getting Started  | 1.4x           | 14           | Onboarding, first-time users      |
| Features         | 1.2x           | 12           | How to use platform features      |
| AI Features      | 1.1x           | 11           | AI-powered tools, RAG, matching   |
| General Docs     | 1.0x           | 10           | Other documentation               |
| API Reference    | 0.3x (or 0.15x)| 3            | Technical integration, developers |

---

## Testing Prioritization

### Expected Behavior

| User Query                      | Should Return                          | Should NOT Return First      |
|---------------------------------|----------------------------------------|------------------------------|
| "create event"                  | Admin guide for event creation         | POST /api/events             |
| "assign judges"                 | Admin judging assignment guide         | PUT /api/assignments         |
| "team matching"                 | Feature guide: AI team matching        | GET /api/teams/match         |
| "api create event"              | POST /api/events + admin guide context | (API docs are correct here)  |
| "endpoint for judging"          | Judging API endpoints                  | (API docs are correct here)  |

### Test Queries (Run in Platform)

```bash
# Should prioritize UI docs:
curl -X POST /api/chat -d '{"message": "How do I create a hackathon?"}'
curl -X POST /api/chat -d '{"message": "How does judging work?"}'
curl -X POST /api/chat -d '{"message": "Can teams collaborate?"}'

# Should allow API docs:
curl -X POST /api/chat -d '{"message": "What is the API for creating events?"}'
curl -X POST /api/chat -d '{"message": "Show me the registration endpoint"}'
```

---

## Customization

### Adjusting Boost Values

Edit `src/lib/rag/retrieval.ts`:

```typescript
const CATEGORY_BOOST: Record<string, number> = {
  admin: 2.0, // Increase admin priority even more
  api: 0.1,   // Suppress API docs further
};
```

### Adding API Keywords

Update the `isApiQuery()` function:

```typescript
function isApiQuery(query: string): boolean {
  const apiKeywords = /\b(api|endpoint|route|rest|http|webhook|curl)\b/i;
  return apiKeywords.test(query);
}
```

### Changing Chat Prompt Behavior

Edit `src/lib/rag/chat.ts`:

```typescript
const AUTHENTICATED_SYSTEM_PROMPT = `
Rules:
- **NEVER cite API docs unless explicitly requested**
- Always explain features from a user's perspective
`;
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ User Query: "How do I create an event?"                         │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
          ┌────────────────────────┐
          │  1. Query Embedding    │
          │  (OpenAI text-3-small) │
          └────────┬───────────────┘
                   │
                   ▼
          ┌────────────────────────┐
          │  2. Vector Search      │
          │  (MongoDB Atlas)       │
          │  - Finds 15 candidates │
          └────────┬───────────────┘
                   │
                   ▼
          ┌────────────────────────┐
          │  3. Category Boosting  │
          │  Admin: 1.5x           │
          │  API: 0.15x            │
          └────────┬───────────────┘
                   │
                   ▼
          ┌────────────────────────┐
          │  4. Re-rank & Select   │
          │  Top 5 results         │
          └────────┬───────────────┘
                   │
                   ▼
          ┌────────────────────────┐
          │  5. Build Context      │
          │  - Admin guide         │
          │  - Feature docs        │
          │  - (API suppressed)    │
          └────────┬───────────────┘
                   │
                   ▼
          ┌────────────────────────┐
          │  6. LLM Generation     │
          │  (GPT-4o + prompt)     │
          │  - Prefers UI content  │
          └────────┬───────────────┘
                   │
                   ▼
          ┌────────────────────────┐
          │  Response: "To create  │
          │  an event, go to Admin │
          │  → Events → Create..." │
          └────────────────────────┘
```

---

## Files Modified

1. **`src/lib/rag/retrieval.ts`** - Vector search with category boosting
2. **`src/lib/rag/chat.ts`** - System prompts prioritizing UI docs
3. **`docs/mongohacks-docs/docusaurus.config.ts`** - Algolia search config
4. **`docs/mongohacks-docs/algolia-crawler-config.json`** - Page rank values

---

## Related Documentation

- **Algolia Search Setup:** `docs/mongohacks-docs/ALGOLIA_SETUP.md`
- **RAG Implementation:** `src/lib/rag/README.md` (if exists)
- **Chat API Endpoint:** `src/app/api/chat/route.ts`

---

## Troubleshooting

**Problem:** API docs still appearing first for general queries

**Solutions:**
1. Lower `CATEGORY_BOOST.api` value (e.g., 0.1 instead of 0.3)
2. Add more API keywords to `isApiQuery()`
3. Increase `admin` and `features` boost values
4. Check if query is being classified as API query (add logging)

**Problem:** Users complaining they can't find API docs

**Solutions:**
1. Ensure `isApiQuery()` detects their query patterns
2. Add "API Reference" link prominently in chat UI
3. Consider adding a toggle for "Developer Mode" that boosts API docs
4. Train users to use "api" keyword in queries

**Problem:** Inconsistent results between search and chat

**Solutions:**
1. Verify Algolia `page_rank` values match retrieval boost multipliers
2. Check that both use same category naming (admin vs Administration)
3. Ensure Algolia crawler has run recently
4. Test with same queries in both systems

---

**Last Updated:** 2026-02-27  
**Version:** 1.0  
**Contact:** Platform team
