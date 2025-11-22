# Medical Tracker - Backend Setup Guide

## Architecture

Your app now has a **full-stack architecture**:
- **Frontend**: React Native with Expo (runs on port 8081)
- **Backend**: Node.js/Express API server (runs on port 3000)
- **Database**: PostgreSQL (managed by Replit)

## Starting the Backend Server

The backend Express server is already created and configured. To start it:

```bash
npx ts-node server.ts
```

Or if you have a workflow set up:
```bash
npm run server
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login or create new user
  - Body: `{ name: string, password?: string }`
  - Returns: `{ token: string, user: object }`

### Health Checks
- `GET /api/health-checks` - Get all health checks (requires auth)
- `POST /api/health-checks` - Save new health check (requires auth)
- `GET /api/health-checks/:id` - Get specific health check (requires auth)

### Medications
- `GET /api/medications` - Get all medication reminders (requires auth)
- `POST /api/medications` - Create new medication reminder (requires auth)
- `PUT /api/medications/:id` - Update medication reminder (requires auth)
- `DELETE /api/medications/:id` - Delete medication reminder (requires auth)

### Profile
- `GET /api/profile` - Get user profile (requires auth)
- `PUT /api/profile` - Update user profile (requires auth)

## Database Schema

The backend automatically creates these tables on startup:

1. **users** - User accounts
2. **health_checks** - Symptom checks and predictions
3. **medication_reminders** - Medication tracking
4. **user_profiles** - Medical history and allergies

## Running Both Frontend and Backend

### Option 1: Separate Terminals (Recommended for Development)
1. **Terminal 1** - Start the frontend:
   ```bash
   npm run dev
   ```

2. **Terminal 2** - Start the backend:
   ```bash
   npx ts-node server.ts
   ```

### Option 2: Using Workflows
If you have Replit Workflows set up, you can:
1. Keep the existing workflow for the frontend
2. Create a new workflow for the backend that runs `npx ts-node server.ts`

## Environment Variables

The following environment variables are automatically set by Replit:
- `DATABASE_URL` - PostgreSQL connection string
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` - Individual database credentials
- `SESSION_SECRET` - JWT signing key

Frontend environment variables in `.env.local`:
- `REACT_APP_API_URL` - Backend API URL (default: `http://localhost:3000`)

## Testing the API

Once both servers are running, test the API:

```bash
# Login/Create user
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "password": "password"}'

# This returns a JWT token - use it for authenticated requests
# Add to Authorization header: Bearer <token>
```

## App API Integration

The frontend app automatically:
1. Calls `/api/auth/login` when user enters their name
2. Stores the JWT token in local storage
3. Uses the token for all subsequent API requests
4. All data is now persisted on the backend

## Deployment

When deploying to production:
1. Update `REACT_APP_API_URL` to point to your production backend URL
2. Ensure `SESSION_SECRET` is set securely
3. Database URL will point to your production PostgreSQL instance

## Troubleshooting

### Backend won't connect to database
- Check that DATABASE_URL environment variable is set
- Verify PostgreSQL is accessible
- Check logs for connection errors

### Frontend can't reach backend
- Ensure backend is running on port 3000
- Check `REACT_APP_API_URL` in `.env.local`
- Verify CORS is enabled (it is in server.ts)

### JWT token errors
- Token may have expired
- Try logging out and logging back in
- Check that `SESSION_SECRET` environment variable is set
