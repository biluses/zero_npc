'use strict';

exports.up = async function up(knex) {
  // Enum status
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'blocked');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `);

  await knex.schema.createTable('friendships', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.uuid('friend_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.specificType('status', 'friendship_status').notNullable().defaultTo('pending');
    t.timestamps(true, true);
    t.unique(['user_id', 'friend_id']);
  });

  await knex.raw(`
    ALTER TABLE friendships
    ADD CONSTRAINT friendships_no_self_check CHECK (user_id <> friend_id)
  `);

  await knex.schema.raw('CREATE INDEX friendships_user_id_idx ON friendships (user_id, status)');
  await knex.schema.raw('CREATE INDEX friendships_friend_id_idx ON friendships (friend_id, status)');
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('friendships');
  await knex.raw('DROP TYPE IF EXISTS friendship_status');
};
