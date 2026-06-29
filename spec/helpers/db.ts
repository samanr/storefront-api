import pool from '../../src/db';
import { PoolClient } from 'pg';

let txClient: PoolClient;
let originalRelease: () => void;

beforeEach(async () => {
  txClient = await pool.connect();
  originalRelease = txClient.release.bind(txClient);
  await txClient.query('BEGIN');
  // Models call conn.release() after each query — make it a no-op so they
  // don't return txClient to the pool and break the transaction mid-spec.
  spyOn(txClient, 'release');
  spyOn(pool, 'connect').and.callFake(() => Promise.resolve(txClient));
});

afterEach(async () => {
  await txClient.query('ROLLBACK');
  originalRelease();
});
