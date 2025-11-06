# API Documentation - Momentum App

Complete reference for the Momentum REST API.

**Base URL:** `http://localhost:3001` (development)
**Production URL:** `https://api.momentum.app` (production)

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

Tokens are obtained via `/api/auth/login` or `/api/auth/register`.

**Token Expiration:** 7 days

---

## Endpoints

### Authentication

#### Register

Create a new user account.

```http
POST /api/auth/register
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "timezone": "America/New_York"
}
```

**Validation:**
- Email must be valid format
- Password min 8 characters, must contain uppercase, lowercase, number
- Name 2-100 characters
- Timezone must be valid IANA timezone

**Response:** `201 Created`

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "timezone": "America/New_York",
    "subscriptionStatus": "free_trial",
    "createdAt": "2025-11-06T12:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400` - Validation error
- `409` - Email already exists

---

#### Login

Authenticate existing user.

```http
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "timezone": "America/New_York",
    "subscriptionStatus": "premium"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `401` - Invalid credentials

**Rate Limit:** 5 requests per 15 minutes

---

#### Get Current User

Get authenticated user's profile.

```http
GET /api/auth/me
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "timezone": "America/New_York",
  "subscriptionStatus": "premium",
  "subscriptionExpiresAt": "2026-01-01T00:00:00Z",
  "createdAt": "2025-01-01T12:00:00Z"
}
```

**Errors:**
- `401` - Unauthorized (invalid/missing token)

---

### Assessment

#### Submit Assessment

Submit onboarding assessment answers to generate avoidance profile.

```http
POST /api/assessment/submit
```

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "answers": [
    { "questionId": "uuid", "value": 7 },
    { "questionId": "uuid", "value": "weekly" },
    { "questionId": "uuid", "value": 5 }
    // ... 23 total answers
  ]
}
```

**Response:** `200 OK`

```json
{
  "profile": {
    "userId": "uuid",
    "socialScore": 7.2,
    "physicalScore": 4.8,
    "professionalScore": 8.1,
    "emotionalScore": 6.5,
    "primaryZone": "professional",
    "secondaryZone": "social",
    "intensityPreference": "10min",
    "changeStyle": "gradual",
    "assessedAt": "2025-11-06T12:00:00Z"
  }
}
```

**Errors:**
- `400` - Missing or invalid answers
- `401` - Unauthorized

---

### Challenges

#### Get Today's Challenge

Get the personalized daily challenge for the authenticated user.

```http
GET /api/challenges/today
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "id": "daily-challenge-uuid",
  "userId": "user-uuid",
  "scheduledFor": "2025-11-06",
  "status": "pending",
  "challenge": {
    "id": "challenge-uuid",
    "title": "Text Someone You Miss",
    "description": "Think of one person you haven't talked to in over a month but genuinely care about. Send them a text right now—no script, no overthinking.",
    "zone": "social",
    "difficulty": "low",
    "estimatedTime": 5,
    "implementationIntention": {
      "trigger": "When you finish reading this challenge",
      "action": "Open your messages and text that person"
    },
    "identityFrame": "This is what people who value authentic relationships do",
    "meaningConnection": "Every connection you've been putting off is a small act of courage. Reaching out builds the muscle of vulnerability",
    "evidenceType": "screenshot"
  }
}
```

**Errors:**
- `401` - Unauthorized
- `404` - No challenge for today (user hasn't completed onboarding)

---

#### Accept Challenge

Mark today's challenge as accepted.

```http
POST /api/challenges/:id/accept
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "id": "daily-challenge-uuid",
  "status": "accepted",
  "acceptedAt": "2025-11-06T14:30:00Z"
}
```

**Errors:**
- `401` - Unauthorized
- `404` - Challenge not found
- `400` - Challenge already accepted/completed

---

#### Complete Challenge

Submit evidence and complete today's challenge.

```http
POST /api/challenges/:id/complete
```

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "evidenceType": "screenshot",
  "evidenceUrl": "https://s3.amazonaws.com/bucket/evidence/uuid.jpg",
  "reflectionText": "I texted my old friend Sarah. It felt vulnerable but good. She responded immediately and we're catching up next week."
}
```

**Response:** `200 OK`

```json
{
  "id": "daily-challenge-uuid",
  "status": "completed",
  "completedAt": "2025-11-06T18:45:00Z",
  "evidenceUrl": "https://s3.amazonaws.com/bucket/evidence/uuid.jpg",
  "reflectionText": "I texted my old friend Sarah...",
  "streak": {
    "current": 7,
    "longest": 7,
    "milestone": "7-day streak! 🔥"
  },
  "rangeExpansion": {
    "zone": "social",
    "expansion": 5,
    "newRadius": 45
  },
  "rewardCard": {
    "type": "encouragement",
    "content": "Six months ago, today's challenge would have felt impossible. Look at you now."
  }
}
```

**Errors:**
- `401` - Unauthorized
- `404` - Challenge not found
- `400` - Invalid evidence type or missing required fields

---

#### Skip Challenge

Skip today's challenge (breaks streak unless freeze is used).

```http
POST /api/challenges/:id/skip
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "id": "daily-challenge-uuid",
  "status": "skipped",
  "streakBroken": true,
  "newStreak": 0
}
```

---

#### Get Challenge History

Get user's past challenges.

```http
GET /api/challenges/history?limit=30&offset=0
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of challenges to return (default: 30)
- `offset` (optional): Pagination offset (default: 0)
- `status` (optional): Filter by status (pending|accepted|completed|skipped)

**Response:** `200 OK`

```json
{
  "challenges": [
    {
      "id": "uuid",
      "scheduledFor": "2025-11-06",
      "status": "completed",
      "completedAt": "2025-11-06T18:45:00Z",
      "challenge": {
        "title": "Text Someone You Miss",
        "zone": "social",
        "difficulty": "low"
      },
      "reflectionText": "I texted Sarah..."
    }
    // ... more challenges
  ],
  "total": 28,
  "hasMore": false
}
```

---

### Progress

#### Get Range Map

Get user's current range map data for visualization.

```http
GET /api/progress/range-map
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "currentRadius": {
    "social": 45,
    "physical": 32,
    "professional": 28,
    "emotional": 38
  },
  "startRadius": 20,
  "expansionHistory": [
    { "day": 1, "zone": "social", "expansion": 5 },
    { "day": 2, "zone": "physical", "expansion": 3 },
    { "day": 3, "zone": "social", "expansion": 5 }
    // ... all expansions
  ],
  "totalExpansion": {
    "social": 25,
    "physical": 12,
    "professional": 8,
    "emotional": 18
  }
}
```

---

#### Get Streak

Get user's current streak status.

```http
GET /api/progress/streak
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "currentStreak": 7,
  "longestStreak": 14,
  "lastCompletedDate": "2025-11-06",
  "freezeAvailable": true,
  "nextMilestone": {
    "days": 14,
    "daysRemaining": 7
  }
}
```

---

#### Get Stats

Get comprehensive user statistics.

```http
GET /api/progress/stats
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "totalChallengesCompleted": 28,
  "totalChallengesDelivered": 28,
  "completionRate": 100,
  "streakCurrent": 28,
  "streakLongest": 28,
  "byZone": {
    "social": { "completed": 7, "rate": 100 },
    "physical": { "completed": 7, "rate": 100 },
    "professional": { "completed": 7, "rate": 100 },
    "emotional": { "completed": 7, "rate": 100 }
  },
  "byDifficulty": {
    "low": { "completed": 14, "rate": 100 },
    "medium": { "completed": 10, "rate": 100 },
    "high": { "completed": 4, "rate": 100 }
  },
  "evidenceBreakdown": {
    "photo": 12,
    "screenshot": 8,
    "voice": 3,
    "honor": 5
  }
}
```

---

#### Use Streak Freeze

Use a streak freeze to protect current streak.

```http
POST /api/progress/freeze-streak
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "freezeUsed": true,
  "streakProtected": true,
  "freezeAvailableAgain": "2025-11-13"
}
```

**Errors:**
- `400` - No freeze available (already used this week)
- `400` - No active streak to protect

---

### Journal

#### Get Journal Entries

Get user's reflection journal entries.

```http
GET /api/journal/entries?limit=50&offset=0
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "entries": [
    {
      "id": "uuid",
      "dailyChallengeId": "uuid",
      "reflectionText": "I texted Sarah. It felt vulnerable...",
      "createdAt": "2025-11-06T18:45:00Z",
      "challenge": {
        "title": "Text Someone You Miss",
        "zone": "social",
        "difficulty": "low",
        "completedAt": "2025-11-06T18:45:00Z"
      }
    }
    // ... more entries
  ],
  "total": 28
}
```

---

#### Create Journal Entry

Add a reflection to a completed challenge.

```http
POST /api/journal/entry
```

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "dailyChallengeId": "uuid",
  "reflectionText": "Today's challenge showed me that I'm capable of more discomfort than I thought. The cold shower was brutal but I controlled my breathing and made it through."
}
```

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "dailyChallengeId": "uuid",
  "reflectionText": "Today's challenge showed me...",
  "createdAt": "2025-11-06T20:00:00Z"
}
```

---

### File Upload

#### Upload Evidence

Upload evidence file (photo, screenshot, voice note).

```http
POST /api/upload/evidence
```

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: File (max 10MB for photos, 5MB for voice)
- `type`: "photo" | "screenshot" | "voice"

**Response:** `200 OK`

```json
{
  "url": "https://s3.amazonaws.com/momentum-evidence/user-uuid/challenge-uuid/timestamp.jpg",
  "type": "photo",
  "size": 2048576
}
```

**Errors:**
- `400` - File too large
- `400` - Invalid file type
- `413` - Payload too large

---

## Error Responses

All errors follow this format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "statusCode": 400
}
```

### Common Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | `VALIDATION_ERROR` | Request validation failed |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource already exists |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_SERVER_ERROR` | Server error |

---

## Rate Limiting

**General Endpoints:** 100 requests per 15 minutes
**Authentication Endpoints:** 5 requests per 15 minutes
**Upload Endpoints:** 20 requests per hour

Rate limit headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1638360000
```

---

## Pagination

Endpoints that return lists support pagination:

```http
GET /api/endpoint?limit=30&offset=0
```

**Parameters:**
- `limit`: Number of items per page (default: 30, max: 100)
- `offset`: Number of items to skip (default: 0)

**Response includes:**

```json
{
  "items": [...],
  "total": 150,
  "hasMore": true
}
```

---

## Testing

**Postman Collection:** [Download](https://momentum.app/api/postman.json)

**Example cURL:**

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "name": "Test User",
    "timezone": "America/New_York"
  }'

# Get today's challenge
curl -X GET http://localhost:3001/api/challenges/today \
  -H "Authorization: Bearer <your-token>"
```

---

## Webhooks (Future)

Webhooks will be available for:
- Challenge completed
- Streak milestone reached
- Subscription events

---

**Last Updated:** 2025-11-06
**API Version:** 1.0.0
