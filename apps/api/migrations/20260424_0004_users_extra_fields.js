'use strict';

exports.up = async function up(knex) {
  await knex.schema.alterTable('users', (t) => {
    t.string('full_name', 120);
    t.string('address_line1', 160);
    t.string('address_line2', 160);
    t.string('postal_code', 16);
    t.string('province', 80);
    t.string('city', 120);
  });
};

exports.down = async function down(knex) {
  await knex.schema.alterTable('users', (t) => {
    t.dropColumn('full_name');
    t.dropColumn('address_line1');
    t.dropColumn('address_line2');
    t.dropColumn('postal_code');
    t.dropColumn('province');
    t.dropColumn('city');
  });
};
