import { Request, Response } from 'express';
import { Product, ProductStore } from '../models/products';
import dotenv from 'dotenv';
dotenv.config();

const store = new ProductStore();

export const getAllProducts = async (req: Request, res: Response) => {
  const category = req.query.category as string | undefined;
  console.info(`[Products] GET / — category filter: ${category ?? 'none'}`);
  try {
    const products = category
      ? await store.getProductByCategory(category)
      : await store.index();
    console.info(`[Products] Returned ${products.length} products`);
    res.status(200).json({ data: products });
  } catch (err) {
    console.error('[Products] Failed to fetch products', err);
    res.status(400).json({ error: 'Failed to fetch products' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  console.info(`[Products] GET /${id}`);
  try {
    const product = await store.getProductById(id);
    if (!product) {
      console.warn(`[Products] Product not found: id=${id}`);
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.status(200).json({ data: product });
  } catch (err) {
    console.error(`[Products] Failed to fetch product id=${id}`, err);
    res.status(400).json({ error: 'Failed to fetch product' });
  }
};

export const createNewProduct = async (req: Request, res: Response) => {
  console.info('[Products] POST / — creating product');
  try {
    const product: Omit<Product, 'id'> = {
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
    };
    const newProduct = await store.create(product);
    console.info(`[Products] Created product id=${newProduct.id}`);
    res.status(201).json({ data: newProduct });
  } catch (err) {
    console.error('[Products] Failed to create product', err);
    res.status(400).json({ error: 'Failed to create product' });
  }
};

export const getProductByPopularity = async (req: Request, res: Response) => {
  const count = parseInt((req.query.count as string) ?? '5');
  console.info(`[Products] GET /popular — count=${count}`);
  try {
    const popularProducts = await store.getProductByPopularity(count);
    console.info(`[Products] Returned ${popularProducts.length} popular products`);
    res.status(200).json({ data: popularProducts });
  } catch (err) {
    console.error('[Products] Failed to fetch popular products', err);
    res.status(400).json({ error: 'Failed to fetch popular products' });
  }
};
