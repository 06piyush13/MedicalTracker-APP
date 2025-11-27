import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const JWT_SECRET = process.env.SESSION_SECRET || 'your-secret-key';

// Middleware to verify JWT
const verifyToken = (req: Request, res: Response, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes

// 1. USER AUTHENTICATION
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { name, password } = req.body;

    let user = await pool.query('SELECT * FROM users WHERE name = $1', [name]);

    if (user.rows.length === 0) {
      // Create new user
      const hashedPassword = await bcryptjs.hash(password || 'default', 10);
      user = await pool.query(
        'INSERT INTO users (name, password) VALUES ($1, $2) RETURNING *',
        [name, hashedPassword]
      );
    } else if (password) {
      const isValidPassword = await bcryptjs.compare(password, user.rows[0].password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid password' });
      }
    }

    const token = jwt.sign({ userId: user.rows[0].id }, JWT_SECRET);
    res.json({ token, user: user.rows[0] });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// 2. HEALTH CHECKS
app.post('/api/health-checks', verifyToken, async (req: Request, res: Response) => {
  try {
    const { symptoms, prediction, medications, nextSteps } = req.body;
    const result = await pool.query(
      `INSERT INTO health_checks (user_id, symptoms, prediction, medications, next_steps) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.userId, JSON.stringify(symptoms), prediction, JSON.stringify(medications), JSON.stringify(nextSteps)]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Save health check error:', error);
    res.status(500).json({ error: 'Failed to save health check' });
  }
});

app.get('/api/health-checks', verifyToken, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM health_checks WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    const checks = result.rows.map((row: any) => ({
      id: row.id,
      date: row.created_at,
      symptoms: Array.isArray(row.symptoms) ? row.symptoms : JSON.parse(row.symptoms || '[]'),
      prediction: row.prediction,
      medications: Array.isArray(row.medications) ? row.medications : JSON.parse(row.medications || '[]'),
      nextSteps: Array.isArray(row.next_steps) ? row.next_steps : JSON.parse(row.next_steps || '[]'),
    }));
    res.json(checks);
  } catch (error) {
    console.error('Get health checks error:', error);
    res.status(500).json({ error: 'Failed to get health checks' });
  }
});

app.get('/api/health-checks/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM health_checks WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Health check not found' });
    }
    const row = result.rows[0];
    res.json({
      id: row.id,
      date: row.created_at,
      symptoms: Array.isArray(row.symptoms) ? row.symptoms : JSON.parse(row.symptoms || '[]'),
      prediction: row.prediction,
      medications: Array.isArray(row.medications) ? row.medications : JSON.parse(row.medications || '[]'),
      nextSteps: Array.isArray(row.next_steps) ? row.next_steps : JSON.parse(row.next_steps || '[]'),
    });
  } catch (error) {
    console.error('Get health check error:', error);
    res.status(500).json({ error: 'Failed to get health check' });
  }
});

// 3. MEDICATION REMINDERS
app.post('/api/medications', verifyToken, async (req: Request, res: Response) => {
  try {
    const { medicationName, dosage, frequency, time, daysOfWeek, enabled, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO medication_reminders (user_id, medication_name, dosage, frequency, time, days_of_week, enabled, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.userId, medicationName, dosage, frequency, time, JSON.stringify(daysOfWeek), enabled, notes]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Save medication error:', error);
    res.status(500).json({ error: 'Failed to save medication' });
  }
});

app.get('/api/medications', verifyToken, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM medication_reminders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    const medications = result.rows.map((row: any) => ({
      id: row.id,
      medicationName: row.medication_name,
      dosage: row.dosage,
      frequency: row.frequency,
      time: row.time,
      daysOfWeek: Array.isArray(row.days_of_week) ? row.days_of_week : JSON.parse(row.days_of_week || '[]'),
      enabled: row.enabled,
      notes: row.notes,
    }));
    res.json(medications);
  } catch (error) {
    console.error('Get medications error:', error);
    res.status(500).json({ error: 'Failed to get medications' });
  }
});

app.put('/api/medications/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { medicationName, dosage, frequency, time, daysOfWeek, enabled, notes } = req.body;
    const result = await pool.query(
      `UPDATE medication_reminders 
       SET medication_name = $1, dosage = $2, frequency = $3, time = $4, days_of_week = $5, enabled = $6, notes = $7
       WHERE id = $8 AND user_id = $9 RETURNING *`,
      [medicationName, dosage, frequency, time, JSON.stringify(daysOfWeek), enabled, notes, req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update medication error:', error);
    res.status(500).json({ error: 'Failed to update medication' });
  }
});

app.delete('/api/medications/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM medication_reminders WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Delete medication error:', error);
    res.status(500).json({ error: 'Failed to delete medication' });
  }
});

// 4. USER PROFILE
app.get('/api/profile', verifyToken, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [req.userId]
    );
    if (result.rows.length === 0) {
      return res.json({
        name: '',
        medicalHistory: [],
        allergies: [],
        medications: [],
        lastUpdated: new Date().toISOString(),
      });
    }
    const row = result.rows[0];
    res.json({
      name: row.name,
      medicalHistory: Array.isArray(row.medical_history) ? row.medical_history : JSON.parse(row.medical_history || '[]'),
      allergies: Array.isArray(row.allergies) ? row.allergies : JSON.parse(row.allergies || '[]'),
      medications: Array.isArray(row.medications) ? row.medications : JSON.parse(row.medications || '[]'),
      lastUpdated: row.updated_at,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

app.put('/api/profile', verifyToken, async (req: Request, res: Response) => {
  try {
    const { name, medicalHistory, allergies, medications } = req.body;
    const result = await pool.query(
      `INSERT INTO user_profiles (user_id, name, medical_history, allergies, medications)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET
       name = $2, medical_history = $3, allergies = $4, medications = $5, updated_at = NOW()
       RETURNING *`,
      [req.userId, name, JSON.stringify(medicalHistory), JSON.stringify(allergies), JSON.stringify(medications)]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK' });
});

// Initialize database tables
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS health_checks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        symptoms TEXT,
        prediction TEXT,
        medications TEXT,
        next_steps TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS medication_reminders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        medication_name VARCHAR(255),
        dosage VARCHAR(255),
        frequency VARCHAR(255),
        time VARCHAR(5),
        days_of_week TEXT,
        enabled BOOLEAN DEFAULT true,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255),
        medical_history TEXT,
        allergies TEXT,
        medications TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database tables initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

initializeDatabase();

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}
