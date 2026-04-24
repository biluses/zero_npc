'use strict';

exports.up = async function up(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  await knex.schema.createTable('users', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('email', 254).notNullable().unique();
    t.string('password_hash');
    t.enu('login_type', ['email', 'google', 'apple'], { useNative: true, enumName: 'login_type' })
      .notNullable()
      .defaultTo('email');
    t.string('google_id').unique();
    t.string('apple_id').unique();
    t.string('username', 64).unique();
    t.string('first_name', 64);
    t.string('last_name', 64);
    t.string('profile_picture');
    t.timestamp('email_verified_at');
    t.string('verification_otp', 12);
    t.timestamp('verification_otp_expires_at');
    t.string('reset_otp', 12);
    t.timestamp('reset_otp_expires_at');
    t.enu('role', ['user', 'admin'], { useNative: true, enumName: 'user_role' })
      .notNullable()
      .defaultTo('user');
    t.boolean('is_active').notNullable().defaultTo(true);
    t.integer('token_charges').notNullable().defaultTo(5);
    t.timestamp('last_charge_reset_at');
    t.timestamp('last_login_at');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('categories', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('name', 120).notNullable().unique();
    t.string('slug', 140).notNullable().unique();
    t.text('description');
    t.string('icon_url');
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamps(true, true);
  });

  await knex.schema.createTable('products', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('sku', 64).notNullable().unique();
    t.string('name', 160).notNullable();
    t.string('slug', 180).notNullable().unique();
    t.text('description');
    t.integer('price_cents').notNullable().defaultTo(0);
    t.string('currency', 3).notNullable().defaultTo('EUR');
    t.integer('stock').notNullable().defaultTo(0);
    t.string('image_url');
    t.boolean('is_pin').notNullable().defaultTo(false);
    t.boolean('is_active').notNullable().defaultTo(true);
    t.uuid('category_id').references('id').inTable('categories').onDelete('SET NULL');
    t.timestamps(true, true);
  });
  await knex.schema.raw('CREATE INDEX products_category_id_idx ON products (category_id)');
  await knex.schema.raw('CREATE INDEX products_is_pin_idx ON products (is_pin)');
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('products');
  await knex.schema.dropTableIfExists('categories');
  await knex.schema.dropTableIfExists('users');
  await knex.raw('DROP TYPE IF EXISTS login_type');
  await knex.raw('DROP TYPE IF EXISTS user_role');
};
