import express from 'express';
import {
  createNewProduct,
  getAllProducts,
  getProductById,
  getProductByPopularity,
} from '../handlers/products';
import authenticate from '../middleware/auth';

const router = express.Router();

// public routes
router.get('/', getAllProducts);
router.get('/popular', getProductByPopularity);
router.get('/:id', getProductById);

// protected routes
router.post('/', authenticate, createNewProduct);

export default router;
