'use strict';

exports.up = async function up(knex) {
  await knex.schema.createTable('orders', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    t.enu(
      'status',
      ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'],
      { useNative: true, enumName: 'order_status' },
    )
      .notNullable()
      .defaultTo('pending');
    t.integer('total_cents').notNullable().defaultTo(0);
    t.string('currency', 3).notNullable().defaultTo('EUR');
    t.string('stripe_checkout_session_id').unique();
    t.string('stripe_payment_intent_id');
    t.jsonb('shipping_address');
    t.timestamp('paid_at');
    t.timestamps(true, true);
  });
  await knex.schema.raw('CREATE INDEX orders_user_idx ON orders (user_id)');
  await knex.schema.raw('CREATE INDEX orders_status_idx ON orders (status)');

  await knex.schema.createTable('order_items', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('order_id').notNullable().references('id').inTable('orders').onDelete('CASCADE');
    t.uuid('product_id').notNullable().references('id').inTable('products').onDelete('RESTRICT');
    t.integer('quantity').notNullable().defaultTo(1);
    t.integer('unit_price_cents').notNullable().defaultTo(0);
    t.integer('line_total_cents').notNullable().defaultTo(0);
    t.timestamps(true, true);
  });
  await knex.schema.raw('CREATE INDEX order_items_order_idx ON order_items (order_id)');
  await knex.schema.raw('CREATE INDEX order_items_product_idx ON order_items (product_id)');

  await knex.schema.createTable('chat_messages', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('sender_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.uuid('recipient_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.uuid('exchange_id').references('id').inTable('exchanges').onDelete('SET NULL');
    t.text('body').notNullable();
    t.enu(
      'message_type',
      ['text', 'image', 'system', 'exchange'],
      { useNative: true, enumName: 'chat_message_type' },
    )
      .notNullable()
      .defaultTo('text');
    t.timestamp('read_at');
    t.timestamp('delivered_at');
    t.timestamps(true, true);
  });
  await knex.schema.raw(
    'CREATE INDEX chat_messages_conversation_idx ON chat_messages (sender_id, recipient_id)',
  );
  await knex.schema.raw('CREATE INDEX chat_messages_unread_idx ON chat_messages (recipient_id, read_at)');
  await knex.schema.raw('CREATE INDEX chat_messages_exchange_idx ON chat_messages (exchange_id)');
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('chat_messages');
  await knex.schema.dropTableIfExists('order_items');
  await knex.schema.dropTableIfExists('orders');
  await knex.raw('DROP TYPE IF EXISTS order_status');
  await knex.raw('DROP TYPE IF EXISTS chat_message_type');
};
