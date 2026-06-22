import Client from '../db';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const pepper: string | undefined = process.env.BCRYPT_PASSWORD || '';
const saltrounds: string = process.env.SALT_ROUNDS || '10';

export type User = {
  id: number;
  first_name: string;
  last_name: string;
  password: string;
};

export class UsersStore {
  async index(): Promise<User[]> {
    const conn = await Client.connect();
    const sql = 'SELECT * FROM users';
    const result = await conn.query(sql);
    conn.release();
    return result.rows;
  }

  async show(id: number): Promise<User | null> {
    const conn = await Client.connect();
    const sql = 'SELECT * FROM users WHERE id=($1)';
    const result = await conn.query(sql, [id]);
    conn.release();
    return result.rows[0] ?? null;
  }

  async create(u: Omit<User, 'id'>): Promise<User> {
    const conn = await Client.connect();
    const sql =
      'INSERT INTO users (first_name, last_name, password) VALUES($1, $2, $3) RETURNING *';
    const hash = bcrypt.hashSync(u.password + pepper, parseInt(saltrounds));
    const result = await conn.query(sql, [u.first_name, u.last_name, hash]);
    const user = result.rows[0];

    conn.release();
    return user;
  }

  async update(u: User): Promise<User> {
    const conn = await Client.connect();
    const sql =
      'UPDATE users SET first_name=($1), last_name=($2), username=($3), password=($4) WHERE id=($5) RETURNING *';
    const hash = bcrypt.hashSync(u.password + pepper, parseInt(saltrounds));
    const result = await conn.query(sql, [
      u.first_name,
      u.last_name,
      hash,
      u.id,
    ]);
    const user = result.rows[0];

    conn.release();
    return user;
  }

  async delete(id: string): Promise<User> {
    try {
      const sql = 'DELETE FROM users WHERE id=($1)';
      const conn = await Client.connect();
      const result = await conn.query(sql, [id]);
      const book = result.rows[0];
      conn.release();
      return book;
    } catch (err) {
      throw new Error(`Could not delete book ${id}. Error: ${err}`);
    }
  }

  async authenticate(
    first_name: string,
    last_name: string,
    password: string
  ): Promise<User | null> {
    const conn = await Client.connect();
    const sql = 'SELECT * FROM users WHERE first_name=($1) AND last_name=($2)';
    const result = await conn.query(sql, [first_name, last_name]);
    conn.release();
    if (result.rows.length) {
      const user = result.rows[0];
      if (bcrypt.compareSync(password + pepper, user.password)) {
        return user;
      }
    }
    return null;
  }
}
