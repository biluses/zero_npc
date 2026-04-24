'use strict';

exports.seed = async function seed(knex) {
  await knex('categories')
    .insert([
      { name: 'Moda', slug: 'moda', description: 'Prendas y accesorios', is_active: true },
      { name: 'Pines', slug: 'pines', description: 'Pines físicos NFC', is_active: true },
      { name: 'Arte', slug: 'arte', description: 'Piezas de arte coleccionables', is_active: true },
      { name: 'Tech', slug: 'tech', description: 'Gadgets y tecnología', is_active: true },
    ])
    .onConflict('slug')
    .ignore();
};
