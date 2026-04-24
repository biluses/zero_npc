'use strict';

exports.up = async function up(knex) {
  // posts
  await knex.schema.createTable('posts', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.uuid('with_user_id').references('id').inTable('users').onDelete('SET NULL');
    t.string('image_url');
    t.string('caption', 280).notNullable().defaultTo('');
    t.boolean('is_deleted').notNullable().defaultTo(false);
    t.timestamps(true, true);
  });
  await knex.schema.raw('CREATE INDEX posts_user_id_idx ON posts (user_id)');
  await knex.schema.raw('CREATE INDEX posts_created_at_idx ON posts (created_at DESC)');

  // post_likes
  await knex.schema.createTable('post_likes', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('post_id').notNullable().references('id').inTable('posts').onDelete('CASCADE');
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.unique(['post_id', 'user_id']);
  });

  // post_comments
  await knex.schema.createTable('post_comments', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('post_id').notNullable().references('id').inTable('posts').onDelete('CASCADE');
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.uuid('parent_id').references('id').inTable('post_comments').onDelete('CASCADE');
    t.string('comment', 500).notNullable();
    t.timestamps(true, true);
  });
  await knex.schema.raw('CREATE INDEX post_comments_post_id_idx ON post_comments (post_id)');
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('post_comments');
  await knex.schema.dropTableIfExists('post_likes');
  await knex.schema.dropTableIfExists('posts');
};
