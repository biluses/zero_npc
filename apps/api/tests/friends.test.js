'use strict';

const { createUser, loginAs, authedRequest, truncateAll, closeAll } = require('./helpers');

describe('Friends module', () => {
  let alice;
  let bob;
  let carol;
  let aliceT;
  let bobT;
  let carolT;

  beforeAll(async () => {
    await truncateAll();
    alice = await createUser({ username: 'alice' });
    bob = await createUser({ username: 'bob' });
    carol = await createUser({ username: 'carol' });
    ({ token: aliceT } = await loginAs(alice));
    ({ token: bobT } = await loginAs(bob));
    ({ token: carolT } = await loginAs(carol));
  });

  afterAll(async () => {
    await truncateAll();
    await closeAll();
  });

  test('POST /friends/request/:userId crea solicitud pending y notifica', async () => {
    const aliceApi = authedRequest(aliceT);
    const bobApi = authedRequest(bobT);

    const res = await aliceApi.post(`/api/v1/friends/request/${bob.id}`).expect(201);
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.userId).toBe(alice.id);
    expect(res.body.data.friendId).toBe(bob.id);

    // Bob debería tener notif friend_request
    const notifs = await bobApi.get('/api/v1/notifications').expect(200);
    const req = notifs.body.data.find((n) => n.type === 'friend_request');
    expect(req).toBeDefined();
    expect(req.payload.fromUserId).toBe(alice.id);
  });

  test('request a sí mismo falla', async () => {
    const aliceApi = authedRequest(aliceT);
    await aliceApi.post(`/api/v1/friends/request/${alice.id}`).expect(400);
  });

  test('request duplicada responde 409', async () => {
    const aliceApi = authedRequest(aliceT);
    await aliceApi.post(`/api/v1/friends/request/${carol.id}`).expect(201);
    await aliceApi.post(`/api/v1/friends/request/${carol.id}`).expect(409);
  });

  test('POST /friends/accept/:userId crea simetría y notifica', async () => {
    const bobApi = authedRequest(bobT);
    const aliceApi = authedRequest(aliceT);

    // Alice ya solicitó a Bob en test anterior (beforeAll no limpia entre tests).
    await bobApi.post(`/api/v1/friends/accept/${alice.id}`).expect(200);

    // Ambos ven al otro en su lista de amigos aceptados.
    const bobFriends = await bobApi.get('/api/v1/friends?status=accepted').expect(200);
    expect(bobFriends.body.data.find((f) => f.friend.id === alice.id)).toBeDefined();

    const aliceFriends = await aliceApi.get('/api/v1/friends?status=accepted').expect(200);
    expect(aliceFriends.body.data.find((f) => f.friend.id === bob.id)).toBeDefined();

    // Alice debería tener notif friend_accepted
    const aliceNotifs = await aliceApi.get('/api/v1/notifications').expect(200);
    expect(aliceNotifs.body.data.find((n) => n.type === 'friend_accepted')).toBeDefined();
  });

  test('GET /friends/discover incluye campo relationship', async () => {
    const aliceApi = authedRequest(aliceT);
    const res = await aliceApi.get('/api/v1/friends/discover').expect(200);
    expect(Array.isArray(res.body.data)).toBe(true);

    const bobEntry = res.body.data.find((u) => u.id === bob.id);
    expect(bobEntry).toBeDefined();
    expect(bobEntry.relationship).toBe('accepted');

    const carolEntry = res.body.data.find((u) => u.id === carol.id);
    expect(carolEntry.relationship).toBe('pending_outgoing'); // alice -> carol pending
  });

  test('DELETE /friends/:userId elimina relación simétrica', async () => {
    const aliceApi = authedRequest(aliceT);
    await aliceApi.delete(`/api/v1/friends/${bob.id}`).expect(200);

    const friends = await aliceApi.get('/api/v1/friends?status=accepted').expect(200);
    expect(friends.body.data.find((f) => f.friend.id === bob.id)).toBeUndefined();
  });

  test('GET /friends/requests?type=incoming solo muestra pendientes recibidas', async () => {
    const bobApi = authedRequest(bobT);
    // Carol solicita a bob para este test
    const carolApi = authedRequest(carolT);
    await carolApi.post(`/api/v1/friends/request/${bob.id}`).expect(201);

    const incoming = await bobApi.get('/api/v1/friends/requests?type=incoming').expect(200);
    expect(incoming.body.data.length).toBeGreaterThanOrEqual(1);
    expect(incoming.body.data.find((r) => r.otherUser.id === carol.id)).toBeDefined();
  });
});
