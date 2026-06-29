import pool from '../../src/db';
import { PoolClient } from 'pg';

let testConnection: PoolClient;

beforeEach(async () => {
  testConnection = await pool.connect();
  await testConnection.query('BEGIN');
  spyOn(pool, 'query').and.callFake((text: any, values?: any) =>
    testConnection.query(text, values)
  );
});

afterEach(async () => {
  await testConnection.query('ROLLBACK');
  testConnection.release();
});
