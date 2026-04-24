'use strict';

const { request, app, closeAll } = require('./helpers');

describe('Policy module (público)', () => {
  afterAll(async () => {
    await closeAll();
  });

  test('GET /policies/privacy devuelve contenido sin auth', async () => {
    const res = await request(app).get('/api/v1/policies/privacy').expect(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.data.type).toBe('privacy');
    expect(res.body.data.title).toBeTruthy();
    expect(typeof res.body.data.content).toBe('string');
    expect(res.body.data.content.length).toBeGreaterThan(100);
  });

  test('GET /policies/cookies sin auth OK', async () => {
    const res = await request(app).get('/api/v1/policies/cookies').expect(200);
    expect(res.body.data.type).toBe('cookies');
  });

  test('GET /policies/terms sin auth OK', async () => {
    const res = await request(app).get('/api/v1/policies/terms').expect(200);
    expect(res.body.data.type).toBe('terms');
  });

  test('GET /policies/invalid tipo rechazado con 422', async () => {
    await request(app).get('/api/v1/policies/invalid-type').expect(422);
  });
});
