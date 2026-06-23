import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UsersStore } from '../models/users';
import dotenv from 'dotenv';
dotenv.config();

const store = new UsersStore();

export const login = async (req: Request, res: Response) => {
  const { first_name, last_name, password } = req.body;
  if (!first_name || !last_name || !password) {
    res.status(400).json({ error: 'first_name, last_name and password are required' });
    return;
  }
  try {
    const user = await store.authenticate(first_name, last_name, password);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const secret = process.env.TOKEN_SECRET;
    if (!secret) throw new Error('TOKEN_SECRET not configured');
    const token = jwt.sign({ user }, secret);
    res.json({ token });
  } catch (err) {
    console.error('[Auth] Login failed', err);
    res.status(500).json({ error: 'Login failed' });
  }
};
