import { Request, Response } from 'express';
import { OrderStore } from '../models/orders';

const store = new OrderStore();

export const addToOrder = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const productId = parseInt(req.body.product_id);
  const quantity = parseInt(req.body.quantity);

  if (isNaN(productId) || isNaN(quantity) || quantity < 1) {
    res
      .status(400)
      .json({ error: 'product_id and quantity (min 1) are required' });
    return;
  }

  console.info(
    `[Orders] POST /orders — userId=${userId} productId=${productId} quantity=${quantity}`
  );

  try {
    let order = await store.getActiveOrderByUser(userId);

    if (!order) {
      console.info(
        `[Orders] No active order for userId=${userId} — creating new order`
      );
      order = await store.create(userId);
    }

    await store.addProduct(order.id, productId, quantity);
    console.info(`[Orders] Added product ${productId} to order ${order.id}`);

    const updatedOrder = await store.getOrderByUserAndStatus(userId, 'active');
    res.status(201).json({ data: updatedOrder });
  } catch (err) {
    console.error(
      `[Orders] Failed to add product to order for userId=${userId}`,
      err
    );
    res.status(500).json({ error: 'Failed to add product to order' });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  const userId = parseInt(req.query.userId as string);
  const status = req.query.status as string;

  console.info(`[Orders] GET /orders — userId=${userId} status=${status}`);

  if (isNaN(userId)) {
    res.status(400).json({ error: 'userId is required and must be a number' });
    return;
  }

  if (status !== 'active' && status !== 'complete') {
    res.status(400).json({ error: 'status must be "active" or "complete"' });
    return;
  }

  try {
    const order = await store.getOrderByUserAndStatus(userId, status);
    if (!order) {
      console.warn(`[Orders] No ${status} order found for userId=${userId}`);
      res.status(404).json({ error: `No ${status} order found for this user` });
      return;
    }
    console.info(
      `[Orders] Returned ${status} order id=${order.id} for userId=${userId}`
    );
    res.status(200).json({ data: order });
  } catch (err) {
    console.error(`[Orders] Failed to fetch order for userId=${userId}`, err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};
