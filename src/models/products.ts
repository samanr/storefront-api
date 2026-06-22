import Client from '../db';

export type Product = {
  id: number;
  name: string;
  price: number;
  category?: string;
};

export class ProductStore {
  async index(): Promise<Product[]> {
    const conn = await Client.connect();
    const sql = 'SELECT * FROM products';
    const result = await conn.query(sql);
    conn.release();
    return result.rows;
  }

  async getProductById(id: number): Promise<Product> {
    const conn = await Client.connect();
    const sql = 'SELECT * FROM products WHERE id=($1)';
    const result = await conn.query(sql, [id]);
    conn.release();
    return result.rows[0];
  }

  async create(product: Omit<Product, 'id'>): Promise<Product> {
    try {
      const conn = await Client.connect();
      const sql =
        'INSERT INTO products (name, price, category) VALUES($1, $2, $3) RETURNING *';
      const result = await conn.query(sql, [
        product.name,
        product.price,
        product.category,
      ]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not create product. Error: ${err}`);
    }
  }

  async delete(id: string): Promise<Product> {
    try {
      const sql = 'DELETE FROM products WHERE id=($1)';
      const conn = await Client.connect();

      const result = await conn.query(sql, [id]);

      const book = result.rows[0];

      conn.release();

      return book;
    } catch (err) {
      throw new Error(`Could not delete product ${id}. Error: ${err}`);
    }
  }

  async getProductByCategory(category: string): Promise<Product[]> {
    try {
      const sql = 'SELECT * FROM products WHERE category=($1)';
      const conn = await Client.connect();

      const result = await conn.query(sql, [category]);

      const products = result.rows;

      conn.release();

      return products;
    } catch (err) {
      throw new Error(
        `Could not fetch products by category: ${category}. Error: ${err}`
      );
    }
  }

  async getProductByPopularity(count: number): Promise<Product[]> {
    try {
      const sql =
        'SELECT p.*, SUM(op.quantity) AS total_sold FROM products p INNER JOIN order_products op ON p.id = op.product_id GROUP BY p.id ORDER BY total_sold DESC LIMIT $1';
      const conn = await Client.connect();

      const result = await conn.query(sql, [count]);

      const products = result.rows;

      conn.release();

      return products;
    } catch (err) {
      throw new Error(`Could not fetch products by popularity. Error: ${err}`);
    }
  }
}
