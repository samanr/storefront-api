import express, { Express } from 'express';
import request from 'supertest';
import { login } from '../handlers/auth';
import { UsersStore } from '../models/users';
import { User } from '../models/users';

describe('Auth Handler — POST /api/login', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post('/api/login', login);
    spyOn(console, 'info');
    spyOn(console, 'warn');
    spyOn(console, 'error');
  });

  it('returns 400 when required fields are missing', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ first_name: 'John' });
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('required');
  });

  it('returns 401 when credentials are invalid', async () => {
    spyOn(UsersStore.prototype, 'authenticate').and.returnValue(Promise.resolve(null));
    const response = await request(app)
      .post('/api/login')
      .send({ first_name: 'John', last_name: 'Doe', password: 'wrong' });
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid credentials');
  });

  it('returns 200 with a JWT token string when credentials are valid', async () => {
    const mockUser: User = { id: 1, first_name: 'John', last_name: 'Doe', password: 'hash' };
    spyOn(UsersStore.prototype, 'authenticate').and.returnValue(Promise.resolve(mockUser));
    const response = await request(app)
      .post('/api/login')
      .send({ first_name: 'John', last_name: 'Doe', password: 'password' });
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(typeof response.body.token).toBe('string');
  });
});
