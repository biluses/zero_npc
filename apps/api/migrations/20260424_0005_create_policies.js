'use strict';

exports.up = async function up(knex) {
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE policy_type AS ENUM ('privacy', 'cookies', 'terms');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `);

  await knex.schema.createTable('policies', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.specificType('type', 'policy_type').notNullable().unique();
    t.string('title', 200).notNullable();
    t.text('content').notNullable();
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('policies');
  await knex.raw('DROP TYPE IF EXISTS policy_type');
};
