'use strict';

exports.up = async function up(knex) {
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE notification_type AS ENUM (
        'token_sent',
        'token_received',
        'token_rejected',
        'token_accepted',
        'post_like',
        'post_comment',
        'message_new',
        'friend_request',
        'friend_accepted',
        'exchange_validated',
        'exchange_cancelled'
      );
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `);

  await knex.schema.createTable('notifications', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.specificType('type', 'notification_type').notNullable();
    t.jsonb('payload').notNullable().defaultTo('{}');
    t.timestamp('read_at');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.raw(
    'CREATE INDEX notifications_user_created_idx ON notifications (user_id, created_at DESC)',
  );
  await knex.schema.raw(
    'CREATE INDEX notifications_unread_idx ON notifications (user_id) WHERE read_at IS NULL',
  );
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('notifications');
  await knex.raw('DROP TYPE IF EXISTS notification_type');
};
