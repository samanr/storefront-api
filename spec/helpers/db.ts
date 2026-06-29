import pool from '../../src/db';
import { PoolClient } from 'pg';

let txClient: PoolClient;

beforeEach(async () => {
  txClient = await pool.connect();
  await txClient.query('BEGIN');
  spyOn(pool, 'query').and.callFake((text: any, values?: any) =>
    txClient.query(text, values)
  );
});

afterEach(async () => {
  await txClient.query('ROLLBACK');
  txClient.release();
});
