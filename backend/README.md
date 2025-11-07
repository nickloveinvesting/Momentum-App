# Momentum Backend API

Research-backed daily micro-action platform backend built with Node.js, Express, TypeScript, and PostgreSQL.

## Overview

The Momentum backend provides a RESTful API for managing users, challenges, progress tracking, and journal entries. Built on behavioral science principles including the Progress Principle, Tiny Habits, and Self-Determination Theory.

## Features

- **Authentication System**: JWT-based authentication with secure password hashing
- **User Management**: Profile management and user preferences
- **Challenge System**: Daily challenge delivery, acceptance, completion, and skipping
- **Progress Tracking**: Range map visualization, streak tracking, and statistics
- **Journal System**: Evidence entries and reflections
- **Security**: Helmet, CORS, rate limiting, input validation
- **Database**: PostgreSQL with connection pooling and transaction support

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **Security**: Helmet, CORS, express-rate-limit

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- PostgreSQL 14.x or higher
- Access to the shared types package (@momentum/shared)

## Installation

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure your database and JWT settings.

3. **Set up the database**:

   ```bash
   # Create the database
   createdb momentum

   # Run the schema from the database directory
   psql momentum < ../database/schema.sql
   ```

4. **Build the TypeScript code**:
   ```bash
   npm run build
   ```

## Development

Start the development server with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the PORT specified in .env).

## Production

Build and start the production server:

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

| Method | Endpoint             | Description               | Auth Required |
| ------ | -------------------- | ------------------------- | ------------- |
| POST   | `/api/auth/register` | Register a new user       | No            |
| POST   | `/api/auth/login`    | Login with email/password | No            |
| GET    | `/api/auth/me`       | Get current user          | Yes           |
| POST   | `/api/auth/logout`   | Logout current user       | Yes           |

### Users

| Method | Endpoint             | Description         | Auth Required |
| ------ | -------------------- | ------------------- | ------------- |
| GET    | `/api/users/profile` | Get user profile    | Yes           |
| PUT    | `/api/users/profile` | Update user profile | Yes           |

### Challenges

| Method | Endpoint                       | Description                      | Auth Required |
| ------ | ------------------------------ | -------------------------------- | ------------- |
| GET    | `/api/challenges/today`        | Get today's challenge            | Yes           |
| POST   | `/api/challenges/:id/accept`   | Accept a challenge               | Yes           |
| POST   | `/api/challenges/:id/complete` | Complete challenge with evidence | Yes           |
| POST   | `/api/challenges/:id/skip`     | Skip today's challenge           | Yes           |
| GET    | `/api/challenges/history`      | Get challenge history            | Yes           |

### Progress

| Method | Endpoint                      | Description         | Auth Required |
| ------ | ----------------------------- | ------------------- | ------------- |
| GET    | `/api/progress/range-map`     | Get range map data  | Yes           |
| GET    | `/api/progress/streak`        | Get streak status   | Yes           |
| GET    | `/api/progress/stats`         | Get user statistics | Yes           |
| POST   | `/api/progress/freeze-streak` | Use streak freeze   | Yes           |

### Journal

| Method | Endpoint                 | Description             | Auth Required |
| ------ | ------------------------ | ----------------------- | ------------- |
| GET    | `/api/journal/entries`   | Get all journal entries | Yes           |
| POST   | `/api/journal/entry`     | Create journal entry    | Yes           |
| GET    | `/api/journal/entry/:id` | Get specific entry      | Yes           |

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts         # PostgreSQL connection pool
│   │   └── jwt.ts              # JWT configuration
│   ├── controllers/
│   │   ├── authController.ts   # Authentication logic
│   │   ├── challengeController.ts
│   │   ├── progressController.ts
│   │   ├── journalController.ts
│   │   └── userController.ts
│   ├── middleware/
│   │   ├── auth.ts             # JWT authentication middleware
│   │   ├── errorHandler.ts    # Error handling middleware
│   │   ├── validator.ts        # Request validation
│   │   └── rateLimiter.ts      # Rate limiting
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── challenges.ts
│   │   ├── progress.ts
│   │   ├── journal.ts
│   │   └── users.ts
│   ├── services/
│   │   ├── userService.ts      # User database operations
│   │   ├── challengeService.ts # Challenge database operations
│   │   └── progressService.ts  # Progress database operations
│   └── server.ts               # Main application entry point
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected endpoints:

1. Register or login to receive a JWT token
2. Include the token in the Authorization header:
   ```
   Authorization: Bearer <your-token-here>
   ```

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "ErrorType",
  "message": "Human-readable error message",
  "statusCode": 400
}
```

Common status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (authentication required)
- `404`: Not Found
- `409`: Conflict (duplicate resource)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

## Rate Limiting

- General API: 100 requests per 15 minutes
- Authentication endpoints: 5 requests per 15 minutes
- Challenge submissions: 20 requests per hour

## Security Features

- **Helmet**: Security headers
- **CORS**: Configurable cross-origin resource sharing
- **bcrypt**: Password hashing with salt rounds
- **JWT**: Stateless authentication
- **express-validator**: Input validation and sanitization
- **Rate limiting**: Prevent abuse and brute force attacks

## Database

The backend uses PostgreSQL with the schema defined in `/database/schema.sql`. Key features:

- Connection pooling for performance
- Transaction support for data consistency
- Prepared statements to prevent SQL injection
- Indexes for optimized queries

## Testing

```bash
npm test
```

## Type Checking

```bash
npm run type-check
```

## Linting

```bash
npm run lint
```

## Environment Variables

See `.env.example` for all available configuration options.

Required variables:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET`

Optional variables:

- `PORT` (default: 3000)
- `NODE_ENV` (default: development)
- `CORS_ORIGIN` (default: \*)

## Contributing

1. Follow TypeScript best practices
2. Add inline comments for complex logic
3. Use async/await for asynchronous operations
4. Validate all user input
5. Handle errors appropriately
6. Write tests for new features

## License

MIT License - see LICENSE file for details

## Support

For issues or questions, please contact the development team or create an issue in the repository.
