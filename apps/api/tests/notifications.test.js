'use strict';

const { createUser, loginAs, authedRequest, truncateAll, closeAll } = require('./helpers');
const { Notification } = require('../src/models');

describe('Notifications module', () => {
  let alice;
  let bob;
  let aliceT;
  let bobT;

  beforeAll(async () => {
    await truncateAll();
    alice = await createUser({ username: 'alice' });
    bob = await createUser({ username: 'bob' });
    ({ token: aliceT } = await loginAs(alice));
    ({ token: bobT } = await loginAs(bob));
  });

  afterAll(async () => {
    await truncateAll();
    await closeAll();
  });

  beforeEach(async () => {
    // Limpia notifs antes de cada test para aislamiento.
    await Notification.destroy({ where: {} });
  });

  test('GET /notifications vacío al arrancar', async () => {
    const aliceApi = authedRequest(aliceT);
    const res = await aliceApi.get('/api/v1/notifications').expect(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta.total).toBe(0);
  });

  test('GET /notifications/unread-count suma solo unread', async () => {
    await Notification.bulkCreate([
      { userId: alice.id, type: 'post_like', payload: {} },
      { userId: alice.id, type: 'post_like', payload: {}, readAt: new Date() },
      { userId: alice.id, type: 'friend_request', payload: {} },
      { userId: bob.id, type: 'post_like', payload: {} }, // de otro user, no cuenta
    ]);
    const aliceApi = authedRequest(aliceT);
    const res = await aliceApi.get('/api/v1/notifications/unread-count').expect(200);
    expect(res.body.data.count).toBe(2);
  });

  test('PATCH /:id/read marca una como leída', async () => {
    const n = await Notification.create({ userId: alice.id, type: 'post_like', payload: {} });

    const aliceApi = authedRequest(aliceT);
    await aliceApi.patch(`/api/v1/notifications/${n.id}/read`).expect(200);

    const reload = await Notification.findByPk(n.id);
    expect(reload.readAt).toBeInstanceOf(Date);
  });

  test('PATCH /:id/read falla con 403 si no es mía', async () => {
    const n = await Notification.create({ userId: alice.id, type: 'post_like', payload: {} });
    const bobApi = authedRequest(bobT);
    await bobApi.patch(`/api/v1/notifications/${n.id}/read`).expect(403);
  });

  test('PATCH /read-all marca todas las mías como leídas', async () => {
    await Notification.bulkCreate([
      { userId: alice.id, type: 'post_like', payload: {} },
      { userId: alice.id, type: 'friend_request', payload: {} },
      { userId: bob.id, type: 'post_like', payload: {} },
    ]);

    const aliceApi = authedRequest(aliceT);
    const res = await aliceApi.patch('/api/v1/notifications/read-all').expect(200);
    expect(res.body.data.updated).toBe(2);

    const remaining = await aliceApi.get('/api/v1/notifications/unread-count').expect(200);
    expect(remaining.body.data.count).toBe(0);

    // Bob sigue con su notif sin leer
    const bobApi = authedRequest(bobT);
    const bobRes = await bobApi.get('/api/v1/notifications/unread-count').expect(200);
    expect(bobRes.body.data.count).toBe(1);
  });

  test('GET /notifications filtro ?unread=true', async () => {
    await Notification.bulkCreate([
      { userId: alice.id, type: 'post_like', payload: {} },
      { userId: alice.id, type: 'post_like', payload: {}, readAt: new Date() },
    ]);

    const aliceApi = authedRequest(aliceT);
    const res = await aliceApi.get('/api/v1/notifications?unread=true').expect(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].readAt).toBeNull();
  });
});
