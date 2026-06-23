import express, { Express, Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { index, show, create, update } from '../handlers/users';
import { User, UsersStore } from '../models/users';

const mockUser: User = { id: 1, first_name: 'John', last_name: 'Doe', password: 'hash' };

describe('Users Handlers', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    spyOn(console, 'info');
    spyOn(console, 'warn');
    spyOn(console, 'error');
  });

  describe('GET /users — index [token required]', () => {
    it('returns 200 with all users', async () => {
      app.get('/users', index);
      spyOn(UsersStore.prototype, 'index').and.returnValue(Promise.resolve([mockUser]));
      const response = await request(app).get('/users');
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([mockUser]);
    });
  });

  describe('GET /users/:id — show [token required]', () => {
    it('returns 200 with the user when found', async () => {
      app.get('/users/:id', show);
      spyOn(UsersStore.prototype, 'show').and.returnValue(Promise.resolve(mockUser));
      const response = await request(app).get('/users/1');
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockUser);
    });

    it('returns 404 when the user does not exist', async () => {
      app.get('/users/:id', show);
      spyOn(UsersStore.prototype, 'show').and.returnValue(Promise.resolve(null));
      const response = await request(app).get('/users/999');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });

    it('returns 400 for a non-numeric id', async () => {
      app.get('/users/:id', show);
      const response = await request(app).get('/users/abc');
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid user id');
    });
  });

  describe('POST /users — create [token required]', () => {
    it('returns 201 with user created message', async () => {
      app.post('/users', create);
      spyOn(UsersStore.prototype, 'create').and.returnValue(Promise.resolve(mockUser));
      const response = await request(app)
        .post('/users')
        .send({ first_name: 'John', last_name: 'Doe', password: 'password' });
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User created');
    });
  });

  describe('PUT /users/:id — update [token required]', () => {
    const withUser = (userId: number) => (req: Request, res: Response, next: NextFunction) => {
      req.user = { id: userId };
      next();
    };

    it('returns 200 with the updated user data', async () => {
      app.put('/users/:id', withUser(1), update);
      const updatedUser: User = { id: 1, first_name: 'Jane', last_name: 'Doe', password: 'hash' };
      spyOn(UsersStore.prototype, 'show').and.returnValue(Promise.resolve(mockUser));
      spyOn(UsersStore.prototype, 'update').and.returnValue(Promise.resolve(updatedUser));
      const response = await request(app)
        .put('/users/1')
        .send({ first_name: 'Jane', last_name: 'Doe', password: 'newpassword' });
      expect(response.status).toBe(200);
      expect(response.body.data.first_name).toBe('Jane');
    });

    it('returns 404 when the user to update does not exist', async () => {
      app.put('/users/:id', update);
      spyOn(UsersStore.prototype, 'show').and.returnValue(Promise.resolve(null));
      const response = await request(app)
        .put('/users/999')
        .send({ first_name: 'Jane', last_name: 'Doe', password: 'newpassword' });
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });

    it('returns 400 when required fields are missing', async () => {
      app.put('/users/:id', update);
      const response = await request(app)
        .put('/users/1')
        .send({ first_name: 'Jane' });
      expect(response.status).toBe(400);
    });
  });
});
