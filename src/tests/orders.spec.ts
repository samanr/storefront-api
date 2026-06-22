import express, { Express, Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { addToOrder, getOrder } from '../handlers/orders';
import { Order, OrderStore, OrderWithProducts } from '../models/orders';

describe('Orders Handlers', () => {
  let app: Express;
  let mockOrderStore: jasmine.SpyObj<OrderStore>;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    spyOn(console, 'info');
    spyOn(console, 'warn');
    spyOn(console, 'error');

    // 1. Manually build the SpyObj to safely bypass the `createSpyObj` compiler error
    mockOrderStore = {
      getActiveOrderByUser: jasmine.createSpy('getActiveOrderByUser'),
      create: jasmine.createSpy('create'),
      addProduct: jasmine.createSpy('addProduct'),
      getOrderByUserAndStatus: jasmine.createSpy('getOrderByUserAndStatus'),
    } as unknown as jasmine.SpyObj<OrderStore>;

    // 2. Monkey-patch the prototype so it intercepts instances created inside your handler
    spyOn(OrderStore.prototype, 'getActiveOrderByUser').and.callFake(mockOrderStore.getActiveOrderByUser);
    spyOn(OrderStore.prototype, 'create').and.callFake(mockOrderStore.create);
    spyOn(OrderStore.prototype, 'addProduct').and.callFake(mockOrderStore.addProduct);
    spyOn(OrderStore.prototype, 'getOrderByUserAndStatus').and.callFake(mockOrderStore.getOrderByUserAndStatus);
  });

  describe('POST /orders (addToOrder)', () => {
    // Middleware to mock a logged-in user
    const withUser = (userId: number | undefined) => {
      return (req: Request, res: Response, next: NextFunction) => {
        if (userId !== undefined) {
          req.user = { id: userId };
        }
        next();
      };
    };

    it('should return 401 if user is not authenticated', async () => {
      app.post('/orders', withUser(undefined), addToOrder);

      const response = await request(app)
        .post('/orders')
        .send({ product_id: 1, quantity: 2 });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should return 400 if product_id or quantity is invalid', async () => {
      app.post('/orders', withUser(42), addToOrder);

      const response = await request(app)
        .post('/orders')
        .send({ product_id: 'invalid', quantity: 0 });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('product_id and quantity (min 1) are required');
    });

    it('should add product to an existing active order and return 201', async () => {
      app.post('/orders', withUser(42), addToOrder);

      const mockOrder = <OrderWithProducts>{ id: 100, user_id: 42, status: 'active' };
      mockOrderStore.getActiveOrderByUser.and.returnValue(Promise.resolve(mockOrder));
      mockOrderStore.addProduct.and.returnValue(Promise.resolve());
      mockOrderStore.getOrderByUserAndStatus.and.returnValue(Promise.resolve(mockOrder));

      const response = await request(app)
        .post('/orders')
        .send({ product_id: 5, quantity: 3 });

      expect(response.status).toBe(201);
      expect(response.body.data).toEqual(mockOrder);
      expect(mockOrderStore.getActiveOrderByUser).toHaveBeenCalledWith(42);
      expect(mockOrderStore.addProduct).toHaveBeenCalledWith(100, 5, 3);
      expect(mockOrderStore.create).not.toHaveBeenCalled();
    });

    it('should create a new order if no active order exists', async () => {
      app.post('/orders', withUser(42), addToOrder);

      const mockNewOrder = <OrderWithProducts>{ id: 101, user_id: 42, status: 'active' };
      mockOrderStore.getActiveOrderByUser.and.returnValue(Promise.resolve(null));
      mockOrderStore.create.and.returnValue(Promise.resolve(mockNewOrder));
      mockOrderStore.addProduct.and.returnValue(Promise.resolve());
      mockOrderStore.getOrderByUserAndStatus.and.returnValue(Promise.resolve(mockNewOrder));

      const response = await request(app)
        .post('/orders')
        .send({ product_id: 5, quantity: 3 });

      expect(response.status).toBe(201);
      expect(mockOrderStore.create).toHaveBeenCalledWith(42);
      expect(mockOrderStore.addProduct).toHaveBeenCalledWith(101, 5, 3);
    });

    it('should return 500 if database operations fail', async () => {
      app.post('/orders', withUser(42), addToOrder);
      mockOrderStore.getActiveOrderByUser.and.throwError('DB Error');

      const response = await request(app)
        .post('/orders')
        .send({ product_id: 5, quantity: 3 });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to add product to order');
    });
  });

  describe('GET /orders (getOrder)', () => {
    beforeEach(() => {
      app.get('/orders', getOrder);
    });

    it('should return 400 if userId query parameter is missing or invalid', async () => {
      const response = await request(app).get('/orders?status=active');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('userId is required and must be a number');
    });

    it('should return 400 if status is invalid', async () => {
      const response = await request(app).get('/orders?userId=42&status=shipped');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('status must be "active" or "complete"');
    });

    it('should return 404 if no order matches query criteria', async () => {
      mockOrderStore.getOrderByUserAndStatus.and.returnValue(Promise.resolve(null));

      const response = await request(app).get('/orders?userId=42&status=active');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('No active order found for this user');
    });

    it('should return 200 and the order data on success', async () => {
      const mockOrder =  <OrderWithProducts>{ id: 200, user_id: 42, status: 'complete' };
      mockOrderStore.getOrderByUserAndStatus.and.returnValue(Promise.resolve(mockOrder));

      const response = await request(app).get('/orders?userId=42&status=complete');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockOrder);
      expect(mockOrderStore.getOrderByUserAndStatus).toHaveBeenCalledWith(42, 'complete');
    });
  });
});