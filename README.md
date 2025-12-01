## Medical Tracker

Medical Tracker is a full-stack mobile application designed to help users track their health, manage medications, and perform symptom checks. It features a React Native frontend built with Expo and a Node.js/Express backend with a PostgreSQL database.

## IMAGES

![alt text](image-1.png)

![alt text](image-2.png)

![alt text](image-3.png)

![alt text](image-4.png)

![alt text](image-5.png)

![alt text](image-6.png)

![alt text](image-7.png)

## Features

- **User Authentication**: Secure login and registration system.
- **Health Checks**: Perform symptom checks and receive predictions.
- **Medication Reminders**: Track medications and set reminders.
- **User Profiles**: Manage medical history and allergies.
- **Full-Stack Architecture**: Robust backend API handling data persistence.

## Tech Stack

- **Frontend**: React Native, Expo, TypeScript
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

- Node.js (v18 or later recommended)
- Docker Desktop (for local PostgreSQL database)
- Expo Go app (for testing on mobile device)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd medical-tracker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Configuration

### Backend Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/medicaltracker
SESSION_SECRET=your-secret-key
```

### Frontend Environment Variables
Create a `.env.local` file in the root directory:
```env
REACT_APP_API_URL=http://localhost:3000
```

## Running the Application

### 1. Start the Database
Ensure Docker Desktop is running, then start the PostgreSQL container:
```bash
docker-compose up -d
```

### 2. Start the Backend Server
Run the backend server in a separate terminal:
```bash
npm run server
# or
npx ts-node server.ts
```
The server will start on `http://localhost:3000`.

### 3. Start the Frontend Application
Run the Expo development server in another terminal:
```bash
npm run dev
# or
npx expo start
```
Scan the QR code with the Expo Go app on your mobile device or press `w` to run in the web browser.

## API Documentation

The backend provides the following API endpoints:

### Authentication
- `POST /api/auth/login`: Login or register a user.

### Health Checks
- `GET /api/health-checks`: Get all health checks.
- `POST /api/health-checks`: Save a new health check.
- `GET /api/health-checks/:id`: Get a specific health check.

### Medications
- `GET /api/medications`: Get all medication reminders.
- `POST /api/medications`: Create a new medication reminder.
- `PUT /api/medications/:id`: Update a medication reminder.
- `DELETE /api/medications/:id`: Delete a medication reminder.

### Profile
- `GET /api/profile`: Get user profile.
- `PUT /api/profile`: Update user profile.

## Project Structure

- `App.tsx`: Main entry point of the React Native app.
- `server.ts`: Entry point of the Express backend server.
- `screens/`: Contains React Native screens.
- `components/`: Reusable UI components.
- `navigation/`: Navigation configuration.
- `hooks/`: Custom React hooks.
- `utils/`: Utility functions.
- `constants/`: App constants.
- `contexts/`: React Contexts for state management.
- `assets/`: Images and other static assets.
## Author

**Piyush Chandrakar**
🎓 B.Tech in ECE @ IIIT Naya Raipur
📧 [www.linkedin.com/in/piyushchandrakar13](https://www.linkedin.com/in/piyushchandrakar13)
