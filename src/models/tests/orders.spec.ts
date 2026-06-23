import { OrderStore } from '../orders';
import { UsersStore } from '../users';
import { ProductStore } from '../products';

describe('OrderStore — database actions', () => {
  const orderStore = new OrderStore();
  const usersStore = new UsersStore();
  const productStore = new ProductStore();

  let testUserId: number;
  let testProductId: number;

  beforeAll(async () => {
    const user = await usersStore.create({ first_name: 'Order', last_name: 'Tester', password: 'pass123' });
    testUserId = user.id;
    const product = await productStore.create({ name: 'Order Spec Product', price: 20, category: 'test' });
    testProductId = product.id;
  });

  afterAll(async () => {
    // CASCADE on users deletes orders and order_products automatically
    await usersStore.delete(String(testUserId));
    await productStore.delete(String(testProductId));
  });

  it('create returns a new active order for the user', async () => {
    const order = await orderStore.create(testUserId);
    expect(order.id).toBeDefined();
    expect(order.user_id).toBe(testUserId);
    expect(order.status).toBe('active');
  });

  it('getActiveOrderByUser returns the active order', async () => {
    // Ensure at least one order exists (create creates one above but order is random)
    await orderStore.create(testUserId);
    const result = await orderStore.getActiveOrderByUser(testUserId);
    expect(result).not.toBeNull();
    expect(result!.user_id).toBe(testUserId);
    expect(result!.status).toBe('active');
  });

  it('getActiveOrderByUser returns null for a user with no orders', async () => {
    const result = await orderStore.getActiveOrderByUser(999999);
    expect(result).toBeNull();
  });

  it('addProduct adds a product to an order without throwing', async () => {
    const order = await orderStore.create(testUserId);
    await expectAsync(orderStore.addProduct(order.id, testProductId, 2)).toBeResolved();
  });

  it('getOrderByUserAndStatus returns the order with its products', async () => {
    // Use a dedicated isolated user so we know the exact state
    const isolatedUser = await usersStore.create({ first_name: 'Isolated', last_name: 'OrderSpec', password: 'pass' });
    const order = await orderStore.create(isolatedUser.id);
    await orderStore.addProduct(order.id, testProductId, 7);

    const result = await orderStore.getOrderByUserAndStatus(isolatedUser.id, 'active');
    expect(result).not.toBeNull();
    expect(Array.isArray(result!.products)).toBe(true);
    expect(result!.products.length).toBe(1);
    expect(result!.products[0].id).toBe(testProductId);
    expect(result!.products[0].quantity).toBe(7);

    await usersStore.delete(String(isolatedUser.id));
  });
});
