# Judging System - Setup Guide

## Quick Start

### 1. Assign Judge Role

Judges need the `judge` role in the database. Use MongoDB shell:

```bash
mongosh "mongodb+srv://mike:Password678%21@performance.zbcul.mongodb.net/hackathons" --quiet --eval "
db.users.updateOne(
  { email: 'judge@example.com' },
  { \$set: { role: 'judge' } }
);
"
```

Or update multiple users:

```bash
mongosh "mongodb+srv://mike:Password678%21@performance.zbcul.mongodb.net/hackathons" --quiet --eval "
db.users.updateMany(
  { email: { \$in: ['judge1@example.com', 'judge2@example.com'] } },
  { \$set: { role: 'judge' } }
);
"
```

### 2. Judge Access

Once a user has the `judge` role, they can:
- Visit `/judging/{eventId}` to see submitted projects
- Score projects on 4 criteria (1-10 each)
- Add optional feedback comments
- Update scores after submission

### 3. Admin Views Results

Admins can view results at any time:
- Go to `/admin/events`
- Click the **trophy icon** 🏆 next to any event
- See live leaderboard as judges submit scores

## Scoring Criteria

Each project is judged on 4 criteria (1-10 scale):

1. **Innovation** - How creative and original is the solution?
2. **Technical Complexity** - How technically challenging and well-executed?
3. **Impact** - How useful and impactful is this solution?
4. **Presentation** - Quality of demo, documentation, and overall presentation

**Total Score:** Sum of all 4 criteria (max 40 points)

## Workflow

### For Judges:

```
1. Admin assigns judge role
2. Judge logs in
3. Navigate to /judging/{eventId}
4. Click "Score Project" on any project
5. Review GitHub repo, demo, docs
6. Rate each criterion using sliders
7. Add feedback comments (optional)
8. Submit score
```

### For Admins:

```
1. Assign judge roles to users
2. Monitor results at /admin/events/{eventId}/results
3. See live updates as judges submit
4. Review top 3 podium
5. Export results to CSV
6. Announce winners!
```

## Features

### Judge Interface

- ✅ List all submitted projects
- ✅ View project details (description, tech stack, innovations)
- ✅ Direct links to GitHub, demo, docs
- ✅ Slider-based scoring (1-10 for each criterion)
- ✅ Real-time total calculation
- ✅ Comment field for feedback
- ✅ Visual indicator for already-scored projects
- ✅ Update scores after initial submission

### Results Page

- ✅ Top 3 podium with gold/silver/bronze styling
- ✅ Full leaderboard sorted by total score
- ✅ Average scores across all judges
- ✅ Breakdown by criteria
- ✅ Individual judge scores (expandable)
- ✅ Export to CSV
- ✅ Judge feedback comments

## Scoring Logic

**Average Calculation:**
- Each project scored by multiple judges
- Results show **average** of all judge scores
- Example: Project A scored by 3 judges
  - Judge 1: 35/40
  - Judge 2: 38/40
  - Judge 3: 36/40
  - **Average: 36.3/40**

**Ranking:**
- Projects sorted by average total score (highest first)
- Ties broken by innovation score
- Projects without scores not included in results

## Database Schema

### Score Collection

```typescript
{
  _id: ObjectId,
  projectId: ObjectId (ref: Project),
  eventId: ObjectId (ref: Event),
  judgeId: ObjectId (ref: User),
  scores: {
    innovation: 8,      // 1-10
    technical: 9,       // 1-10
    impact: 7,          // 1-10
    presentation: 8     // 1-10
  },
  totalScore: 32,       // Auto-calculated (8+9+7+8)
  comments: "Great work on the UX!",
  submittedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ projectId: 1, judgeId: 1 }` - Unique (one score per judge per project)
- `{ eventId: 1 }` - Fast event filtering
- `{ judgeId: 1 }` - Judge queries

## API Endpoints

### Judge Endpoints

**GET /api/judging/{eventId}/projects**
- Requires: `judge` or `admin` role
- Returns: All submitted projects with judge's existing scores
- Use: Load judging interface

**POST /api/judging/{eventId}/score**
- Requires: `judge` or `admin` role
- Body: `{ projectId, innovation, technical, impact, presentation, comments }`
- Validation: All scores must be 1-10
- Use: Submit or update scores

### Admin Endpoints

**GET /api/admin/events/{eventId}/results**
- Requires: `admin` role
- Returns: All projects with average scores, sorted by total
- Includes: Individual judge scores and comments
- Use: View leaderboard and results

## Example Usage

### Assign Judge via Script

```bash
# Create a judge account
mongosh "mongodb+srv://..." --eval "
db.users.insertOne({
  email: 'sarah.judge@example.com',
  name: 'Sarah Johnson',
  passwordHash: '\$2b\$10\$...', // bcrypt hash
  role: 'judge',
  createdAt: new Date(),
  updatedAt: new Date()
});
"
```

### Test Scoring Flow

1. **Setup:**
   ```bash
   # Assign yourself judge role
   mongosh "..." --eval "db.users.updateOne({email: 'your@email.com'}, {\$set: {role: 'judge'}})"
   ```

2. **Judge:**
   - Visit `/judging/{eventId}`
   - Score a project
   - Submit scores

3. **Verify:**
   - Visit `/admin/events/{eventId}/results`
   - See your scores appear
   - Check leaderboard

## Tips

**For Best Results:**
- Assign 3-5 judges per event (reduces bias)
- Provide judging rubric/guidelines to judges
- Set a scoring deadline
- Review outlier scores for inconsistencies
- Export results before announcing winners

**Common Issues:**
- "Only judges can access" → User lacks `judge` role
- Empty results page → No scores submitted yet
- Can't update score → Project ID mismatch

## Future Enhancements

Potential additions:
- [ ] Judge assignments (assign specific projects to specific judges)
- [ ] Weighted criteria (make some criteria worth more)
- [ ] Public results page (filtered view for participants)
- [ ] Real-time scoring dashboard
- [ ] Judge consensus indicators
- [ ] Blind judging (hide team names)

---

**Status:** ✅ Production-ready  
**Last Updated:** 2026-02-25  
**Version:** 1.0
