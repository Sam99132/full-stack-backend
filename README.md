# Full Stack Backend - Authentication API

A Node.js/Express backend API for user authentication with JWT tokens, using Prisma ORM and Neon DB (serverless PostgreSQL).

## Features

- User signup with password hashing (bcrypt)
- User login with JWT token generation
- Neon DB (serverless PostgreSQL) integration with Prisma ORM
- Password validation and security
- Type-safe database queries
- JWT tokens verifiable on jwt.io

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Neon DB

1. Create a free account at [Neon](https://neon.tech)
2. Create a new project
3. Copy your connection strings from the Neon dashboard:
   - **Connection Pooler URL** (for `DATABASE_URL`)
   - **Direct Connection URL** (for `DIRECT_URL`)

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp env.example .env
```

Edit `.env` and set your configuration:
- `DATABASE_URL`: Neon connection pooler URL (from Neon dashboard)
- `DIRECT_URL`: Neon direct connection URL (from Neon dashboard)
- `JWT_SECRET`: A strong secret key for JWT signing
- `PORT`: Server port (default: 5000)

**Example `.env` file:**
```env
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://username:password@ep-xxx-xxx-direct.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
NODE_ENV=development
```

### 4. Set Up Prisma

Generate Prisma Client and run migrations:

```bash
# Generate Prisma Client
npm run prisma:generate

# Create and run database migrations
npm run prisma:migrate
```

This will create the database tables in your Neon database based on the Prisma schema.

### 5. Run the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

## API Endpoints

### POST `/api/auth/signup`

Create a new user account. The password will be hashed and stored in the database.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**After signup, verify in Neon DB:**
- Go to your Neon dashboard → SQL Editor
- Run: `SELECT id, email, password, created_at FROM users;`
- You should see the new user with a hashed password (starts with `$2a$` or `$2b$`)

### POST `/api/auth/login`

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## JWT Token Verification

The JWT token returned from signup/login can be verified at [jwt.io](https://jwt.io).

### Steps to Verify:

1. Copy the `token` from the API response
2. Go to [jwt.io](https://jwt.io)
3. Paste the token in the "Encoded" section
4. Enter your `JWT_SECRET` from `.env` in the "Verify Signature" section
5. The decoded payload will be displayed

**Token Payload Structure:**
```json
{
  "userId": 1,
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## Database

The application uses Neon DB (serverless PostgreSQL) with Prisma ORM. The `users` table contains:
- `id`: Primary key (auto-increment integer)
- `email`: Unique user email (stored in lowercase)
- `password`: Hashed password (using bcrypt with salt rounds of 12)
- `created_at`: Timestamp of account creation
- `updated_at`: Timestamp of last update

### Prisma Commands

- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Create and run database migrations
- `npm run prisma:deploy` - Deploy migrations to production
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

The database schema is defined in `prisma/schema.prisma`. After making changes to the schema, run migrations to update the database.

### Viewing Data in Neon

1. Go to your Neon project dashboard
2. Click on "SQL Editor"
3. Run queries like:
   ```sql
   SELECT * FROM users;
   SELECT id, email, created_at FROM users;
   ```

## Testing the API

### Using cURL

**Signup:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Using Postman or Thunder Client

1. Set method to `POST`
2. URL: `http://localhost:5000/api/auth/signup` or `/api/auth/login`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
   ```json
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```

## Security Features

- Passwords are hashed using bcrypt with 12 salt rounds
- JWT tokens expire after 7 days
- Email validation (format checking)
- Password minimum length validation (6 characters)
- Unique email constraint
- SQL injection protection via Prisma
- HTTPS support via Neon DB SSL connections

## Troubleshooting

### Connection Issues

If you see connection errors:
1. Verify your `DATABASE_URL` and `DIRECT_URL` are correct
2. Check that your Neon project is active
3. Ensure SSL mode is set to `require` in the connection string
4. Verify your IP is not blocked (Neon allows all IPs by default)

### Migration Issues

If migrations fail:
1. Make sure `DIRECT_URL` is set correctly
2. Run `npm run prisma:generate` first
3. Check Prisma logs for specific errors

