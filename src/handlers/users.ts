import { Request, Response } from 'express';
import { User, UsersStore } from '../models/users';
import dotenv from 'dotenv';
dotenv.config();

const store = new UsersStore();

export const index = async (req: Request, res: Response) => {
  console.info('[Users] GET / — fetching all users');
  try {
    const users = await store.index();
    console.info(`[Users] Returned ${users.length} users`);
    res.status(200).json({ data: users });
  } catch (err) {
    console.error('[Users] Failed to fetch users', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const show = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  console.info(`[Users] GET /${id}`);

  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid user id' });
    return;
  }

  try {
    const user = await store.show(id);
    if (!user) {
      console.warn(`[Users] User not found: id=${id}`);
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(200).json({ data: user });
  } catch (err) {
    console.error(`[Users] Failed to fetch user id=${id}`, err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const update = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  console.info(`[Users] PUT /${id} — updating user`);

  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid user id' });
    return;
  }

  const { first_name, last_name, password } = req.body;
  if (!first_name || !last_name || !password) {
    res.status(400).json({ error: 'first_name, last_name and password are required' });
    return;
  }

  try {
    const existing = await store.show(id);
    if (!existing) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const updated = await store.update({ id, first_name, last_name, password });
    console.info(`[Users] Updated user id=${id}`);
    res.status(200).json({ data: { id: updated.id, first_name: updated.first_name, last_name: updated.last_name } });
  } catch (err) {
    console.error(`[Users] Failed to update user id=${id}`, err);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const create = async (req: Request, res: Response) => {
  console.info('[Users] POST / — creating user');
  const user: Omit<User, 'id'> = {
    password: req.body.password,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
  };
  try {
    const newUser = await store.create(user);
    console.info(`[Users] Created user id=${newUser.id}`);
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    console.error('[Users] Failed to create user', err);
    res.status(400).json({ error: 'Failed to create user' });
  }
};
