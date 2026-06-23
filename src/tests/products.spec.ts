import express, { Express } from 'express';
import request from 'supertest';
import {
  getAllProducts,
  getProductById,
  createNewProduct,
  getProductByPopularity,
} from '../handlers/products';
import { Product, ProductStore } from '../models/products';

describe('Products Handlers', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    spyOn(console, 'info');
    spyOn(console, 'warn');
    spyOn(console, 'error');
  });

  describe('GET /products — index', () => {
    it('returns 200 with all products', async () => {
      app.get('/products', getAllProducts);
      const mockProducts: Product[] = [{ id: 1, name: 'Widget', price: 10, category: 'tools' }];
      spyOn(ProductStore.prototype, 'index').and.returnValue(Promise.resolve(mockProducts));
      const response = await request(app).get('/products');
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockProducts);
    });
  });

  describe('GET /products?category=X — filter by category', () => {
    it('returns 200 with products matching the category', async () => {
      app.get('/products', getAllProducts);
      const mockProducts: Product[] = [{ id: 1, name: 'Widget', price: 10, category: 'tools' }];
      spyOn(ProductStore.prototype, 'getProductByCategory').and.returnValue(
        Promise.resolve(mockProducts)
      );
      const response = await request(app).get('/products?category=tools');
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockProducts);
    });
  });

  describe('GET /products/popular — top N popular products', () => {
    it('returns 200 with popular products', async () => {
      app.get('/products/popular', getProductByPopularity);
      const mockProducts = [{ id: 1, name: 'Widget', price: 10, category: 'tools', total_sold: 42 }];
      spyOn(ProductStore.prototype, 'getProductByPopularity').and.returnValue(
        Promise.resolve(mockProducts as Product[])
      );
      const response = await request(app).get('/products/popular');
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockProducts);
    });
  });

  describe('GET /products/:id — single product', () => {
    it('returns 200 with the product when found', async () => {
      app.get('/products/:id', getProductById);
      const mockProduct: Product = { id: 1, name: 'Widget', price: 10, category: 'tools' };
      spyOn(ProductStore.prototype, 'getProductById').and.returnValue(
        Promise.resolve(mockProduct)
      );
      const response = await request(app).get('/products/1');
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockProduct);
    });

    it('returns 404 when the product does not exist', async () => {
      app.get('/products/:id', getProductById);
      spyOn(ProductStore.prototype, 'getProductById').and.returnValue(
        Promise.resolve(undefined as unknown as Product)
      );
      const response = await request(app).get('/products/999');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Product not found');
    });
  });

  describe('POST /products — create product [token required]', () => {
    it('returns 201 with the created product', async () => {
      app.post('/products', createNewProduct);
      const mockProduct: Product = { id: 2, name: 'Gadget', price: 50, category: 'electronics' };
      spyOn(ProductStore.prototype, 'create').and.returnValue(Promise.resolve(mockProduct));
      const response = await request(app)
        .post('/products')
        .send({ name: 'Gadget', price: 50, category: 'electronics' });
      expect(response.status).toBe(201);
      expect(response.body.data).toEqual(mockProduct);
    });
  });
});
