# API Documentation

## Base URL

```
http://localhost:3000
```

## Authentication

Most endpoints use JWT Bearer token authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-access-token>
```

---

## Authentication Endpoints

### POST /api/login

Authenticate and receive access and refresh tokens.

**Request Body:**
```json
{
  "username": "admin",
  "password": "your-password"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Missing username or password
- `401` - Invalid credentials
- `500` - Server error

---

### POST /api/refresh

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Refresh token required
- `403` - Invalid refresh token
- `401` - Expired or invalid token

---

### POST /api/logout

Invalidate refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Content Endpoints

### GET /api/content

Get team members and job postings with pagination.

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10, max: 100)

**Example Request:**
```
GET /api/content?page=1&limit=10
```

**Response (200 OK):**
```json
{
  "team": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Alex Chen",
      "role": "Founder & CEO",
      "bio": "Visionary leader with 10+ years in AI and Game Dev.",
      "image": "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      "createdAt": "2026-02-12T10:00:00.000Z",
      "updatedAt": "2026-02-12T10:00:00.000Z"
    }
  ],
  "careers": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "AI Engineer",
      "location": "remote",
      "type": "Full-time",
      "description": "Join our core AI team...",
      "applyUrl": "https://forms.google.com/example",
      "createdAt": "2026-02-12T10:00:00.000Z",
      "updatedAt": "2026-02-12T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalTeam": 3,
    "totalCareers": 4,
    "totalPagesTeam": 1,
    "totalPagesCareers": 1
  }
}
```

**Error Responses:**
- `500` - Server error

---

### POST /api/content

Update team members and job postings (requires authentication).

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "team": [
    {
      "name": "Alex Chen",
      "role": "Founder & CEO",
      "bio": "Visionary leader with 10+ years in AI and Game Dev.",
      "image": "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
    }
  ],
  "careers": [
    {
      "title": "AI Engineer",
      "location": "remote",
      "type": "Full-time",
      "description": "Join our core AI team...",
      "applyUrl": "https://forms.google.com/example"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true
}
```

**Error Responses:**
- `400` - No data provided or invalid format
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (no token provided)
- `500` - Server error

---

## Seed Endpoint

### POST /api/seed

Seed database with initial data from `data/content.json`.

**Response (200 OK):**
```json
{
  "message": "Database seeded"
}
```

**Or if data already exists:**
```json
{
  "message": "Database already has data"
}
```

**Error Responses:**
- `500` - Seed data file not found or server error

---

## Health Check

### GET /health

Check server health and status.

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-02-12T10:00:00.000Z",
  "uptime": 123.45,
  "environment": "development",
  "mongodb": {
    "connected": true,
    "state": "connected"
  },
  "memory": {
    "used": "45 MB",
    "total": "100 MB"
  }
}
```

**Response (503 Service Unavailable):**
```json
{
  "status": "degraded",
  "timestamp": "2026-02-12T10:00:00.000Z",
  "uptime": 123.45,
  "environment": "development",
  "mongodb": {
    "connected": false,
    "state": "disconnected"
  },
  "memory": {
    "used": "45 MB",
    "total": "100 MB"
  }
}
```

---

## Rate Limiting

All endpoints are rate-limited to **100 requests per 15 minutes** per IP address.

**Rate Limit Response (429 Too Many Requests):**
```json
{
  "message": "Too many requests from this IP, please try again later."
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (no token provided)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error
- `503` - Service Unavailable (database disconnected)

---

## Example Usage

### Login and Access Protected Route

```bash
# 1. Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Response: { "success": true, "token": "...", "refreshToken": "..." }

# 2. Use token to update content
curl -X POST http://localhost:3000/api/content \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"team":[],"careers":[]}'
```

### Pagination Example

```bash
# Get first page (10 items)
curl http://localhost:3000/api/content?page=1&limit=10

# Get second page (10 items)
curl http://localhost:3000/api/content?page=2&limit=10

# Get all items (up to 100)
curl http://localhost:3000/api/content?limit=100
```
