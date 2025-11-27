const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/medicaltracker',
});

async function checkConnection() {
    console.log('Checking database connection...');
    try {
        const client = await pool.connect();
        console.log('Successfully connected to PostgreSQL!');
        const res = await client.query('SELECT NOW()');
        console.log('Current Database Time:', res.rows[0].now);
        client.release();
    } catch (err) {
        console.error('Error connecting to database:', err);
    } finally {
        await pool.end();
    }
}

checkConnection();
