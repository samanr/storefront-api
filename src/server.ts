import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import authenticate from './middleware/auth';
import userRoutes from './routes/users';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import { UsersStore } from './models/users';

const app: express.Application = express();
const address: string = '0.0.0.0:3000';
const store = new UsersStore();

app.use(bodyParser.json());

// Public routes
app.use('/api/products', productRoutes);

app.post('/api/login', async (req: Request, res: Response) => {
  const { first_name, last_name, password } = req.body;
  if (!first_name || !last_name || !password) {
    res
      .status(400)
      .json({ error: 'first_name, last_name and password are required' });
    return;
  }
  const user = await store.authenticate(first_name, last_name, password);
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const secret = process.env.TOKEN_SECRET;
  if (!secret) throw new Error('TOKEN_SECRET not configured');
  const token = jwt.sign({ user }, secret);
  res.json({ token });
});

// Protected routes
app.use(authenticate);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

app.listen(3000, function () {
  console.log(`starting app on: ${address}`);
});
