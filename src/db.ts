// Load environment variables from .env file immediately
import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();
const { Pool } = pg;

const isTest = process.env.NODE_ENV === 'test';

const Client = new Pool({
  user: isTest ? 'test_user' : process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: isTest ? 'full_stack_dev-test' : process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT as string, 10),
});

export default Client;
