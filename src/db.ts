// Load environment variables from .env file immediately
import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();
const { Pool } = pg;

const Client = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT as string, 10), // Port must be a number
});

export default Client;
