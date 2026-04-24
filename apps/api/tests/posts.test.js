'use strict';

const { createUser, loginAs, authedRequest, truncateAll, closeAll, request, app } = require('./helpers');

describe('Posts module', () => {
  let alice;
  let bob;
  let aliceToken;
  let bobToken;

  beforeAll(async () => {
    await truncateAll();
    alice = await createUser({ username: 'alice' });
    bob = await createUser({ username: 'bob' });
    ({ token: aliceToken } = await loginAs(alice));
    ({ token: bobToken } = await loginAs(bob));
  });

  afterAll(async () => {
    await truncateAll();
    await closeAll();
  });

  test('POST /posts crea post y lo devuelve con autor', async () => {
    const aliceApi = authedRequest(aliceToken);
    const res = await aliceApi
      .post('/api/v1/posts')
      .field('caption', 'Hola mundo desde test')
      .expect(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.data.caption).toBe('Hola mundo desde test');
    expect(res.body.data.author.username).toBe('alice');
    expect(res.body.data.likeCount).toBe(0);
    expect(res.body.data.isLiked).toBe(false);
  });

  test('GET /posts devuelve feed paginado con meta', async () => {
    const aliceApi = authedRequest(aliceToken);
    // Crea otros 2 posts
    await aliceApi.post('/api/v1/posts').field('caption', 'Segundo post');
    await aliceApi.post('/api/v1/posts').field('caption', 'Tercer post');

    const res = await aliceApi.get('/api/v1/posts?limit=2&offset=0').expect(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeLessThanOrEqual(2);
    expect(res.body.meta).toEqual(
      expect.objectContaining({ limit: 2, offset: 0, total: expect.any(Number) }),
    );
  });

  test('POST /posts/:id/like marca like y crea notificación al autor', async () => {
    const aliceApi = authedRequest(aliceToken);
    const bobApi = authedRequest(bobToken);

    const { body: created } = await aliceApi
      .post('/api/v1/posts')
      .field('caption', 'Post de alice')
      .expect(201);
    const postId = created.data.id;

    // Bob da like al post de Alice
    const like = await bobApi.post(`/api/v1/posts/${postId}/like`).expect(200);
    expect(like.body.data.liked).toBe(true);

    // Alice debería tener 1 notificación de tipo post_like
    const notifs = await aliceApi.get('/api/v1/notifications').expect(200);
    const likeNotif = notifs.body.data.find((n) => n.type === 'post_like');
    expect(likeNotif).toBeDefined();
    expect(likeNotif.payload.byUserId).toBe(bob.id);
  });

  test('DELETE /posts/:id falla si no es dueño (403)', async () => {
    const aliceApi = authedRequest(aliceToken);
    const bobApi = authedRequest(bobToken);

    const { body: created } = await aliceApi
      .post('/api/v1/posts')
      .field('caption', 'Post de alice')
      .expect(201);

    // Bob intenta borrar post de Alice → 403
    await bobApi.delete(`/api/v1/posts/${created.data.id}`).expect(403);

    // Alice SÍ puede borrarlo
    await aliceApi.delete(`/api/v1/posts/${created.data.id}`).expect(200);
  });

  test('POST /posts/:id/comments crea comment y admite respuestas anidadas', async () => {
    const aliceApi = authedRequest(aliceToken);
    const bobApi = authedRequest(bobToken);

    const { body: created } = await aliceApi
      .post('/api/v1/posts')
      .field('caption', 'Hilo de comentarios')
      .expect(201);
    const postId = created.data.id;

    const c1 = await bobApi
      .post(`/api/v1/posts/${postId}/comments`)
      .send({ comment: 'Top-level de bob' })
      .expect(201);

    const reply = await aliceApi
      .post(`/api/v1/posts/${postId}/comments`)
      .send({ comment: 'Respuesta de alice', parentId: c1.body.data.id })
      .expect(201);

    expect(reply.body.data.parentId).toBe(c1.body.data.id);

    // GET comments devuelve árbol con replies
    const tree = await aliceApi.get(`/api/v1/posts/${postId}/comments`).expect(200);
    expect(tree.body.data.length).toBe(1);
    expect(tree.body.data[0].replies.length).toBe(1);
    expect(tree.body.data[0].replies[0].comment).toBe('Respuesta de alice');
  });

  test('POST /posts sin auth devuelve 401', async () => {
    await request(app)
      .post('/api/v1/posts')
      .field('caption', 'Sin token')
      .expect(401);
  });

  test('PATCH /posts/:id con caption > 280 falla validación', async () => {
    const aliceApi = authedRequest(aliceToken);
    const { body: created } = await aliceApi
      .post('/api/v1/posts')
      .field('caption', 'Valid')
      .expect(201);

    const res = await aliceApi
      .patch(`/api/v1/posts/${created.data.id}`)
      .send({ caption: 'x'.repeat(281) });
    expect(res.status).toBe(422);
  });
});
