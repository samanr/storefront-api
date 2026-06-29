import Client from '../db';

export type Product = {
  id: number;
  name: string;
  price: number;
  category?: string;
};

export class ProductStore {
  async index(): Promise<Product[]> {
    const result = await Client.query('SELECT * FROM products');
    return result.rows;
  }

  async getProductById(id: number): Promise<Product> {
    const result = await Client.query('SELECT * FROM products WHERE id=($1)', [id]);
    return result.rows[0];
  }

  async create(product: Omit<Product, 'id'>): Promise<Product> {
    try {
      const result = await Client.query(
        'INSERT INTO products (name, price, category) VALUES($1, $2, $3) RETURNING *',
        [product.name, product.price, product.category]
      );
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not create product. Error: ${err}`);
    }
  }

  async delete(id: string): Promise<Product> {
    try {
      const result = await Client.query('DELETE FROM products WHERE id=($1)', [id]);
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not delete product ${id}. Error: ${err}`);
    }
  }

  async getProductByCategory(category: string): Promise<Product[]> {
    try {
      const result = await Client.query(
        'SELECT * FROM products WHERE category=($1)',
        [category]
      );
      return result.rows;
    } catch (err) {
      throw new Error(`Could not fetch products by category: ${category}. Error: ${err}`);
    }
  }

  async getProductByPopularity(count: number): Promise<Product[]> {
    try {
      const result = await Client.query(
        `SELECT p.*, SUM(op.quantity) AS total_sold
         FROM products p
         INNER JOIN order_products op ON p.id = op.product_id
         GROUP BY p.id
         ORDER BY total_sold DESC
         LIMIT $1`,
        [count]
      );
      return result.rows;
    } catch (err) {
      throw new Error(`Could not fetch products by popularity. Error: ${err}`);
    }
  }
}
