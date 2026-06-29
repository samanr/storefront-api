import { UsersStore } from '../users';

describe('UsersStore — database actions', () => {
  const store = new UsersStore();
  let testUserId: number;
  let showUserId: number;

  beforeAll(async () => {
    const user = await store.create({
      first_name: 'Spec',
      last_name: 'UserModel',
      password: 'testpassword123',
    });
    testUserId = user.id;

    // Separate user owned by the show test — unaffected by update
    const showUser = await store.create({
      first_name: 'Spec',
      last_name: 'ShowOnly',
      password: 'testpassword123',
    });
    showUserId = showUser.id;
  });

  afterAll(async () => {
    await store.delete(String(testUserId));
    await store.delete(String(showUserId));
  });

  it('index returns an array of users', async () => {
    const result = await store.index();
    expect(Array.isArray(result)).toBe(true);
  });

  it('show returns the correct user by id', async () => {
    const result = await store.show(showUserId);
    expect(result).not.toBeNull();
    expect(result!.id).toBe(showUserId);
    expect(result!.first_name).toBe('Spec');
  });

  it('show returns null for a non-existent id', async () => {
    const result = await store.show(999999);
    expect(result).toBeNull();
  });

  it('create returns the new user with a bcrypt-hashed password', async () => {
    const user = await store.create({ first_name: 'Create', last_name: 'Test', password: 'secret' });
    expect(user.id).toBeDefined();
    expect(user.password).not.toBe('secret');
    await store.delete(String(user.id));
  });

  it('update changes the user fields and re-hashes the password', async () => {
    const updated = await store.update({
      id: testUserId,
      first_name: 'Updated',
      last_name: 'UserModel',
      password: 'newpassword',
    });
    expect(updated.first_name).toBe('Updated');
    expect(updated.password).not.toBe('newpassword');
  });

  it('authenticate returns the user for correct credentials', async () => {
    const fresh = await store.create({ first_name: 'Auth', last_name: 'Check', password: 'mypassword' });
    const result = await store.authenticate('Auth', 'Check', 'mypassword');
    expect(result).not.toBeNull();
    expect(result!.id).toBe(fresh.id);
    await store.delete(String(fresh.id));
  });

  it('authenticate returns null for incorrect password', async () => {
    const result = await store.authenticate('Updated', 'UserModel', 'wrongpassword');
    expect(result).toBeNull();
  });

  it('delete removes the user from the database', async () => {
    const user = await store.create({ first_name: 'Delete', last_name: 'Me', password: 'pass' });
    await store.delete(String(user.id));
    const result = await store.show(user.id);
    expect(result).toBeNull();
  });
});
