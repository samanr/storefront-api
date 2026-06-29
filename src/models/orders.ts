import Client from '../db';

export type Order = {
  id: number;
  user_id: number;
  status: 'active' | 'complete';
};

export type OrderProduct = {
  id: number;
  name: string;
  price: number;
  category?: string;
  quantity: number;
};

export type OrderWithProducts = Order & {
  products: OrderProduct[];
};

export class OrderStore {
  async getActiveOrderByUser(userId: number): Promise<Order | null> {
    const result = await Client.query(
      'SELECT * FROM orders WHERE user_id=$1 AND status=$2 LIMIT 1',
      [userId, 'active']
    );
    return result.rows.length ? result.rows[0] : null;
  }

  async create(userId: number): Promise<Order> {
    const result = await Client.query(
      'INSERT INTO orders (user_id, status) VALUES($1, $2) RETURNING *',
      [userId, 'active']
    );
    return result.rows[0];
  }

  async addProduct(orderId: number, productId: number, quantity: number): Promise<void> {
    await Client.query(
      'INSERT INTO order_products (order_id, product_id, quantity) VALUES($1, $2, $3)',
      [orderId, productId, quantity]
    );
  }

  async getOrderByUserAndStatus(
    userId: number,
    status: 'active' | 'complete'
  ): Promise<OrderWithProducts | null> {
    const orderResult = await Client.query(
      'SELECT * FROM orders WHERE user_id=$1 AND status=$2 LIMIT 1',
      [userId, status]
    );

    if (!orderResult.rows.length) return null;

    const order = orderResult.rows[0];

    const productsResult = await Client.query(
      `SELECT p.id, p.name, p.price, p.category, op.quantity
       FROM order_products op
       JOIN products p ON op.product_id = p.id
       WHERE op.order_id = $1`,
      [order.id]
    );

    return { ...order, products: productsResult.rows };
  }
}
