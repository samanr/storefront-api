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
    const result = await Client.query('SELECT * FROM users');
    return result.rows;
  }

  async show(id: number): Promise<User | null> {
    const result = await Client.query('SELECT * FROM users WHERE id=($1)', [id]);
    return result.rows[0] ?? null;
  }

  async create(u: Omit<User, 'id'>): Promise<User> {
    const hash = bcrypt.hashSync(u.password + pepper, parseInt(saltrounds));
    const result = await Client.query(
      'INSERT INTO users (first_name, last_name, password) VALUES($1, $2, $3) RETURNING *',
      [u.first_name, u.last_name, hash]
    );
    return result.rows[0];
  }

  async update(u: User): Promise<User> {
    const hash = bcrypt.hashSync(u.password + pepper, parseInt(saltrounds));
    const result = await Client.query(
      'UPDATE users SET first_name=($1), last_name=($2), password=($3) WHERE id=($4) RETURNING *',
      [u.first_name, u.last_name, hash, u.id]
    );
    return result.rows[0];
  }

  async delete(id: string): Promise<User> {
    try {
      const result = await Client.query('DELETE FROM users WHERE id=($1)', [id]);
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not delete user ${id}. Error: ${err}`);
    }
  }

  async authenticate(
    first_name: string,
    last_name: string,
    password: string
  ): Promise<User | null> {
    const result = await Client.query(
      'SELECT * FROM users WHERE first_name=($1) AND last_name=($2)',
      [first_name, last_name]
    );
    if (result.rows.length) {
      const user = result.rows[0];
      if (bcrypt.compareSync(password + pepper, user.password)) {
        return user;
      }
    }
    return null;
  }
}
