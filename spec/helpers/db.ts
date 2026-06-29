import pool from '../../src/db';
import { PoolClient } from 'pg';

let testConnection: PoolClient;
let originalRelease: () => void;

beforeEach(async () => {
  testConnection = await pool.connect();
  originalRelease = testConnection.release.bind(testConnection);
  await testConnection.query('BEGIN');
  // Models call conn.release() after each query — make it a no-op so they
  // don't return testConnection to the pool and break the transaction mid-spec.
  spyOn(testConnection, 'release');
  spyOn(pool, 'connect').and.callFake(() => Promise.resolve(testConnection));
});

afterEach(async () => {
  await testConnection.query('ROLLBACK');
  originalRelease();
});
