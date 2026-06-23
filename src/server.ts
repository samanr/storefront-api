import express from 'express';
import bodyParser from 'body-parser';
import authenticate from './middleware/auth';
import userRoutes from './routes/users';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import { login } from './handlers/auth';

const app: express.Application = express();
const address: string = '0.0.0.0:3000';

app.use(bodyParser.json());

// Public routes
app.use('/api/products', productRoutes);
app.post('/api/login', login);

// Protected routes
app.use(authenticate);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

app.listen(3000, function () {
  console.log(`starting app on: ${address}`);
});
