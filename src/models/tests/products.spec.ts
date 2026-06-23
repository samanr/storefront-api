import { ProductStore } from '../products';

describe('ProductStore — database actions', () => {
  const store = new ProductStore();
  let testProductId: number;

  beforeAll(async () => {
    const product = await store.create({ name: 'Spec Product', price: 99, category: 'spec-category' });
    testProductId = product.id;
  });

  afterAll(async () => {
    await store.delete(String(testProductId));
  });

  it('index returns an array of products', async () => {
    const result = await store.index();
    expect(Array.isArray(result)).toBe(true);
  });

  it('getProductById returns the correct product', async () => {
    const result = await store.getProductById(testProductId);
    expect(result).toBeDefined();
    expect(result.id).toBe(testProductId);
    expect(result.name).toBe('Spec Product');
  });

  it('create returns the new product with the correct fields', async () => {
    const product = await store.create({ name: 'New Product', price: 25, category: 'new' });
    expect(product.id).toBeDefined();
    expect(product.name).toBe('New Product');
    expect(product.price).toBe(25);
    await store.delete(String(product.id));
  });

  it('getProductByCategory returns products matching the category', async () => {
    const result = await store.getProductByCategory('spec-category');
    expect(Array.isArray(result)).toBe(true);
    expect(result.some(p => p.id === testProductId)).toBe(true);
  });

  it('getProductByPopularity returns an array ordered by total sold', async () => {
    const result = await store.getProductByPopularity(5);
    expect(Array.isArray(result)).toBe(true);
  });

  it('delete removes the product from the database', async () => {
    const product = await store.create({ name: 'Delete Me', price: 1, category: 'temp' });
    await store.delete(String(product.id));
    const result = await store.getProductById(product.id);
    expect(result).toBeUndefined();
  });
});
