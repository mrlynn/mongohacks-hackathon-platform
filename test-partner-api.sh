#!/bin/bash
# Test script for Partner API endpoints
# Usage: ./test-partner-api.sh

BASE_URL="${BASE_URL:-http://localhost:3000}"
API_KEY="${API_KEY:-}"

echo "🧪 Testing Partner API"
echo "Base URL: $BASE_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: GET /api/partners (should work without auth)
echo "📋 Test 1: GET /api/partners (list all partners)"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/partners")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Success${NC} (HTTP $HTTP_CODE)"
    echo "$BODY" | jq -r '.partners | length' | xargs echo "  Partners found:"
else
    echo -e "${RED}✗ Failed${NC} (HTTP $HTTP_CODE)"
    echo "$BODY" | jq '.'
fi
echo ""

# Test 2: GET /api/partners?tier=platinum
echo "📋 Test 2: GET /api/partners?tier=platinum (filter by tier)"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/partners?tier=platinum")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Success${NC} (HTTP $HTTP_CODE)"
    echo "$BODY" | jq -r '.partners | length' | xargs echo "  Platinum partners:"
else
    echo -e "${RED}✗ Failed${NC} (HTTP $HTTP_CODE)"
fi
echo ""

# Test 3: POST /api/partners (requires admin auth - should fail without token)
echo "📋 Test 3: POST /api/partners (create partner - should fail without auth)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/partners" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Test Partner Co",
        "description": "A test partner for API validation",
        "industry": "Technology",
        "tier": "bronze",
        "contacts": [{
            "name": "Jane Smith",
            "email": "jane@testpartner.com",
            "role": "Partnership Manager",
            "isPrimary": true
        }]
    }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -eq 401 ]; then
    echo -e "${YELLOW}✓ Expected${NC} (HTTP $HTTP_CODE - Unauthorized)"
    echo "  Auth protection is working correctly"
elif [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${RED}✗ Unexpected${NC} (HTTP $HTTP_CODE - Created without auth!)"
    echo "$BODY" | jq '.'
else
    echo -e "${RED}✗ Unexpected${NC} (HTTP $HTTP_CODE)"
    echo "$BODY" | jq '.'
fi
echo ""

# Test 4: GET /api/partners/invalid-id (should return 400)
echo "📋 Test 4: GET /api/partners/invalid-id (invalid ObjectId)"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/partners/invalid-id-123")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -eq 400 ]; then
    echo -e "${GREEN}✓ Success${NC} (HTTP $HTTP_CODE - Invalid ID caught)"
else
    echo -e "${RED}✗ Unexpected${NC} (HTTP $HTTP_CODE)"
fi
echo ""

# Test 5: GET /api/partners with pagination
echo "📋 Test 5: GET /api/partners?page=1&limit=5 (pagination)"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/partners?page=1&limit=5")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Success${NC} (HTTP $HTTP_CODE)"
    echo "$BODY" | jq -r '.pagination | "  Page: \(.page)/\(.totalPages), Total: \(.total)"'
else
    echo -e "${RED}✗ Failed${NC} (HTTP $HTTP_CODE)"
fi
echo ""

echo "✅ Partner API test complete"
echo ""
echo "💡 Tips:"
echo "  - To test authenticated endpoints, set API_KEY environment variable"
echo "  - To test against different server, set BASE_URL"
echo "  - Example: BASE_URL=http://localhost:3000 ./test-partner-api.sh"
