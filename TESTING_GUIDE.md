# Testing Guide - MongoHacks Platform

## Quick Start

```bash
# Run all tests
npm test

# Run specific test file
npm test -- summary-service

# Run with coverage
npm run test:coverage

# Watch mode (re-run on file changes)
npm run test:watch
```

---

## Current Test Suite

### ✅ Test Status
- **Total Tests:** 13 passing
- **Test Suites:** 3 files
- **Coverage:** ~15% (Goal: 60%)

### Test Files

**1. `src/__tests__/ai/summary-service.test.ts`** (6 tests)
- AI summary generation with mocked OpenAI
- Handling missing/optional fields
- Quality validation (length, content, buzzwords)

**2. `src/__tests__/api/registration.test.ts`** (3 tests)
- Event registration workflow
- Duplicate registration prevention
- Registration deadline enforcement

**3. `src/__tests__/api/judging.test.ts`** (4 tests)
- Judge assignment validation
- Scoring submission
- Results aggregation
- Access control

---

## AI Summary Service Tests Explained

### What's Being Tested

The `summary-service.test.ts` file tests the AI-powered project summary generation:

```typescript
generateProjectSummary({
  name: "RAG Chatbot",
  description: "...",
  technologies: ["MongoDB", "OpenAI"],
  innovations: "Uses Vector Search..."
})
// → Returns 2-3 sentence summary
```

### How OpenAI is Mocked

**Why mock?**
- Tests run fast (no API calls)
- Free (no OpenAI costs)
- Deterministic (same result every time)
- Works offline

**Mock implementation:**
```typescript
jest.mock('openai', () => {
  const mockCreate = jest.fn().mockResolvedValue({
    choices: [{
      message: {
        content: 'This project builds a RAG chatbot...'
      }
    }]
  });
  
  return jest.fn().mockImplementation(() => ({
    chat: { completions: { create: mockCreate } }
  }));
});
```

This intercepts calls to `openai.chat.completions.create()` and returns a fake response.

### Test Cases

**1. Full project data:**
```typescript
it("should generate summary with all project fields", async () => {
  const projectData = {
    name: "RAG Chatbot",
    description: "...",
    technologies: ["MongoDB", "OpenAI"],
    innovations: "Uses Vector Search"
  };
  
  const summary = await generateProjectSummary(projectData);
  
  expect(summary).toBeDefined();
  expect(summary.length).toBeGreaterThan(50);
  expect(summary).toMatch(/mongodb|vector|rag/);
});
```

**2. Missing optional fields:**
```typescript
it("should handle missing optional fields", async () => {
  const projectData = {
    name: "Simple App",
    description: "Basic app",
    technologies: ["React"]
    // innovations: undefined
  };
  
  const summary = await generateProjectSummary(projectData);
  
  expect(summary).not.toContain('undefined');
  expect(summary).not.toContain('null');
});
```

**3. Empty technologies:**
```typescript
it("should handle empty technologies array", async () => {
  const projectData = {
    name: "Minimal",
    description: "Test",
    technologies: [] // Empty!
  };
  
  const summary = await generateProjectSummary(projectData);
  expect(summary.length).toBeGreaterThan(0);
});
```

**4. Quality validation:**
```typescript
it("should be appropriate length", async () => {
  const summary = await generateProjectSummary(projectData);
  
  expect(summary.length).toBeGreaterThanOrEqual(50);
  expect(summary.length).toBeLessThanOrEqual(500);
  
  const sentences = summary.split(/[.!?]+/);
  expect(sentences.length).toBeGreaterThanOrEqual(2);
});
```

**5. No marketing buzzwords:**
```typescript
it("should not contain marketing buzzwords", async () => {
  const summary = await generateProjectSummary(projectData);
  
  const buzzwords = ['revolutionary', 'game-changing', 'amazing'];
  for (const word of buzzwords) {
    expect(summary.toLowerCase()).not.toContain(word);
  }
});
```

---

## Testing with Real OpenAI (Optional)

### Integration Test

Create `src/__tests__/integration/ai-summary-real.test.ts`:

```typescript
describe('AI Summary Integration (Real API)', () => {
  // Only run when explicitly enabled
  const runIntegration = process.env.RUN_REAL_AI_TESTS === 'true';
  
  (runIntegration ? it : it.skip)('generates real summary', async () => {
    const projectData = {
      name: "RAG Chatbot",
      description: "Real description...",
      technologies: ["MongoDB", "OpenAI"],
    };
    
    // Real API call (costs ~$0.01)
    const summary = await generateProjectSummary(projectData);
    
    console.log('Generated summary:', summary);
    
    // Verify quality
    expect(summary).toMatch(/mongodb/i);
    expect(summary.split('. ').length).toBeGreaterThanOrEqual(2);
  }, 30000); // 30s timeout
});
```

### Run Real API Tests

```bash
# Set API key
export OPENAI_API_KEY=sk-your-key-here

# Run integration tests
RUN_REAL_AI_TESTS=true npm test -- ai-summary-real

# Cost: ~$0.01-0.02 per test run
```

---

## Test Database Setup

Tests use **MongoDB Memory Server** for isolated, in-memory testing:

```typescript
// src/__tests__/utils/db.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

export async function setupTestDB() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}

export async function teardownTestDB() {
  await mongoose.disconnect();
  await mongoServer.stop();
}

export async function clearCollections() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}
```

**Benefits:**
- No need for real MongoDB instance
- Isolated (tests don't affect production)
- Fast (in-memory)
- Clean slate for each test

---

## Coverage Goals

### Sprint 4 Targets (60% coverage)

**Priority areas:**
1. **API routes** (critical business logic)
2. **Database models** (data integrity)
3. **AI services** (expensive operations)
4. **Authentication** (security)

### Current Coverage by Area

| Area | Coverage | Goal | Priority |
|------|----------|------|----------|
| AI Services | 100% | 100% | ✅ Done |
| Models | 45% | 80% | High |
| API Routes | 0% | 60% | High |
| Auth | 0% | 90% | Critical |
| Utils | 0% | 40% | Medium |

---

## Adding New Tests

### 1. Create Test File

```bash
# Pattern: __tests__/path/to/module.test.ts
src/__tests__/api/teams.test.ts
src/__tests__/services/matching.test.ts
src/__tests__/models/Event.test.ts
```

### 2. Basic Template

```typescript
import { setupTestDB, teardownTestDB } from "../utils/db";
import { functionToTest } from "@/path/to/module";

describe("Module Name", () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe("functionToTest", () => {
    it("should do expected behavior", async () => {
      const result = await functionToTest(input);
      
      expect(result).toBeDefined();
      expect(result.property).toBe(expectedValue);
    });
    
    it("should handle edge case", async () => {
      const result = await functionToTest(edgeCase);
      
      expect(result).toEqual(expectedBehavior);
    });
  });
});
```

### 3. Run Your Test

```bash
npm test -- teams.test.ts
```

---

## Common Patterns

### Mocking External Services

**OpenAI:**
```typescript
jest.mock('openai', () => {
  // Mock implementation
});
```

**NextAuth:**
```typescript
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: mockUser } })
}));
```

### Testing API Routes

```typescript
import { GET, POST } from '@/app/api/events/route';

it('GET returns events', async () => {
  const request = new NextRequest('http://localhost/api/events');
  const response = await GET(request);
  const data = await response.json();
  
  expect(response.status).toBe(200);
  expect(data.success).toBe(true);
});
```

### Testing Database Models

```typescript
import { EventModel } from '@/lib/db/models/Event';

it('creates event with valid data', async () => {
  const event = await EventModel.create({
    name: 'Test Event',
    slug: 'test-event',
    // ...
  });
  
  expect(event._id).toBeDefined();
  expect(event.name).toBe('Test Event');
});
```

---

## Debugging Tests

### Run Single Test

```bash
# Run specific file
npm test -- summary-service

# Run specific test case
npm test -- --testNamePattern="should generate summary"
```

### Verbose Output

```bash
npm test -- --verbose
```

### Debug in VS Code

Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "${file}"],
  "console": "integratedTerminal"
}
```

Set breakpoints and press F5.

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
```

---

## Next Steps

1. **Add more tests** to reach 60% coverage
2. **Set up CI/CD** with GitHub Actions
3. **Add E2E tests** with Playwright
4. **Monitor coverage** trends over time

---

## Questions?

- Test failing? Check mock setup
- Need real API test? Use `RUN_REAL_AI_TESTS=true`
- Coverage questions? Run `npm run test:coverage`
- Stuck? Check existing tests for patterns
