import express from 'express';
import { getOrder, addToOrder } from '../handlers/orders';

const router = express.Router();

router.post('/', addToOrder);
router.get('/', getOrder);

export default router;
