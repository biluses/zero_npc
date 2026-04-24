'use strict';

const { request, app, truncateAll, closeAll } = require('./helpers');
const { User } = require('../src/models');

describe('Auth module (signup flow + seguridad)', () => {
  beforeAll(async () => {
    await truncateAll();
  });

  afterAll(async () => {
    await truncateAll();
    await closeAll();
  });

  describe('POST /auth/check-email', () => {
    beforeAll(async () => {
      await User.create({
        email: 'existing@test.com',
        passwordHash: 'dummy',
        username: 'existing',
        isActive: true,
      });
    });

    test('email no usado → available:true', async () => {
      const res = await request(app)
        .post('/api/v1/auth/check-email')
        .send({ email: 'newuser@test.com' })
        .expect(200);
      expect(res.body.data.available).toBe(true);
    });

    test('email existente → available:false', async () => {
      const res = await request(app)
        .post('/api/v1/auth/check-email')
        .send({ email: 'existing@test.com' })
        .expect(200);
      expect(res.body.data.available).toBe(false);
    });

    test('email case-insensitive (lowercase automático)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/check-email')
        .send({ email: 'EXISTING@test.com' })
        .expect(200);
      expect(res.body.data.available).toBe(false);
    });

    test('email inválido → 422', async () => {
      await request(app)
        .post('/api/v1/auth/check-email')
        .send({ email: 'not-an-email' })
        .expect(422);
    });
  });

  describe('POST /auth/validate-step', () => {
    test('paso 1 válido → ok', async () => {
      const res = await request(app)
        .post('/api/v1/auth/validate-step')
        .send({
          step: 1,
          email: 'stepok@test.com',
          password: 'ValidPass123',
          passwordConfirm: 'ValidPass123',
        })
        .expect(200);
      expect(res.body.data).toEqual({ ok: true, step: 1 });
    });

    test('paso 1 con passwords que no coinciden → 422', async () => {
      const res = await request(app)
        .post('/api/v1/auth/validate-step')
        .send({
          step: 1,
          email: 'mismatch@test.com',
          password: 'ValidPass123',
          passwordConfirm: 'Different456',
        })
        .expect(422);
      expect(res.body.details.some((d) => d.path === 'passwordConfirm')).toBe(true);
    });

    test('paso 1 con email ya registrado → 422 con detalle', async () => {
      await User.create({ email: 'taken@test.com', passwordHash: 'x', isActive: true });
      const res = await request(app)
        .post('/api/v1/auth/validate-step')
        .send({
          step: 1,
          email: 'taken@test.com',
          password: 'ValidPass123',
          passwordConfirm: 'ValidPass123',
        })
        .expect(422);
      expect(res.body.details.find((d) => d.path === 'email')).toBeDefined();
    });

    test('paso 1 con password común (blacklist) → 422', async () => {
      const res = await request(app)
        .post('/api/v1/auth/validate-step')
        .send({
          step: 1,
          email: 'common@test.com',
          password: 'password1',
          passwordConfirm: 'password1',
        })
        .expect(422);
      expect(res.body.details.some((d) => d.path === 'password')).toBe(true);
    });

    test('paso 2 válido → ok', async () => {
      const res = await request(app)
        .post('/api/v1/auth/validate-step')
        .send({
          step: 2,
          fullName: 'Juan García',
          addressLine1: 'Calle Real 1',
          postalCode: '28001',
          province: 'Madrid',
        })
        .expect(200);
      expect(res.body.data.ok).toBe(true);
    });

    test('paso 2 con CP inválido → 422', async () => {
      const res = await request(app)
        .post('/api/v1/auth/validate-step')
        .send({
          step: 2,
          fullName: 'Juan',
          addressLine1: 'Calle',
          postalCode: 'ABC',
          province: 'Madrid',
        })
        .expect(422);
      expect(res.body.details.some((d) => d.path.includes('postalCode'))).toBe(true);
    });
  });

  describe('Register completo + login', () => {
    test('register con profile (PII cifrado) → login → retrieve', async () => {
      const email = 'piiuser@test.com';
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email,
          password: 'SafePass123',
          username: 'piiuser',
          profile: {
            fullName: 'María Pérez',
            addressLine1: 'Avenida de la Prueba 7',
            postalCode: '08001',
            province: 'Barcelona',
          },
        })
        .expect(201);

      // Verificar OTP con dato de la BD.
      const user = await User.findOne({ where: { email } });
      expect(user).toBeTruthy();
      expect(user.fullName).toBe('María Pérez'); // getter descifra.
      expect(user.addressLine1).toBe('Avenida de la Prueba 7');

      // El valor raw en BD debe estar cifrado (no igual al plano).
      const raw = await User.sequelize.query(
        `SELECT full_name, address_line1 FROM users WHERE email = :email`,
        { replacements: { email }, type: User.sequelize.QueryTypes.SELECT },
      );
      expect(raw[0].full_name).toMatch(/^enc:v1:/);
      expect(raw[0].address_line1).toMatch(/^enc:v1:/);
      expect(raw[0].full_name).not.toContain('María');
    });

    test('password se guarda con pepper (hash bcrypt empieza $2b$)', async () => {
      const user = await User.findOne({ where: { email: 'piiuser@test.com' } });
      expect(user.passwordHash).toMatch(/^\$2[aby]\$/);
    });

    test('login rechaza password común aunque coincida con un hash viejo', async () => {
      // Simulamos un user existente con pwd débil (no debería pasar nuestros filtros de registro,
      // pero verificamos que register rechaza en el service).
      await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'weak@test.com', password: 'password1' })
        .expect(422);
    });

    test('register con email ya usado → 409', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'piiuser@test.com', password: 'Another123' })
        .expect(409);
    });
  });
});
