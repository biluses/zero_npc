'use strict';

exports.up = async function up(knex) {
  await knex.schema.createTable('tokens', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('product_id').notNullable().references('id').inTable('products').onDelete('RESTRICT');
    t.string('tag_uid', 128).notNullable().unique();
    t.enu('tag_type', ['nfc', 'qr'], { useNative: true, enumName: 'tag_type' })
      .notNullable()
      .defaultTo('nfc');
    t.string('serial', 64).unique();
    t.uuid('original_owner_id').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    t.uuid('current_owner_id').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    t.integer('exchange_count').notNullable().defaultTo(0);
    t.boolean('is_locked').notNullable().defaultTo(false);
    t.timestamp('registered_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('last_exchange_at');
    t.jsonb('metadata');
    t.timestamps(true, true);
  });
  await knex.schema.raw('CREATE INDEX tokens_current_owner_idx ON tokens (current_owner_id)');
  await knex.schema.raw('CREATE INDEX tokens_original_owner_idx ON tokens (original_owner_id)');
  await knex.schema.raw('CREATE INDEX tokens_product_idx ON tokens (product_id)');

  await knex.schema.createTable('exchanges', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('token_id').notNullable().references('id').inTable('tokens').onDelete('CASCADE');
    t.uuid('sender_id').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    t.uuid('recipient_id').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    t.enu(
      'status',
      ['pending', 'accepted', 'validated', 'rejected', 'cancelled', 'expired'],
      { useNative: true, enumName: 'exchange_status' },
    )
      .notNullable()
      .defaultTo('pending');
    t.text('message');
    t.timestamp('accepted_at');
    t.timestamp('validated_at');
    t.timestamp('rejected_at');
    t.timestamp('cancelled_at');
    t.timestamp('expires_at');
    t.enu('scan_method', ['nfc', 'qr'], { useNative: true, enumName: 'scan_method' });
    t.timestamps(true, true);
  });
  await knex.schema.raw('CREATE INDEX exchanges_sender_idx ON exchanges (sender_id)');
  await knex.schema.raw('CREATE INDEX exchanges_recipient_idx ON exchanges (recipient_id)');
  await knex.schema.raw('CREATE INDEX exchanges_status_idx ON exchanges (status)');
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('exchanges');
  await knex.schema.dropTableIfExists('tokens');
  await knex.raw('DROP TYPE IF EXISTS exchange_status');
  await knex.raw('DROP TYPE IF EXISTS scan_method');
  await knex.raw('DROP TYPE IF EXISTS tag_type');
};
