'use strict';

/**
 * Seed de productos demo para que Store, Wardrobe y Tokens no estén vacíos.
 * Alineado con el diseño XD: hoodies, camisetas, bolsas — todos con imagen
 * y varios marcados como `is_pin` para aparecer en el carousel destacado.
 *
 * Idempotente: usa onConflict('sku').ignore() para poder re-correrlo sin duplicar.
 */

exports.seed = async function seed(knex) {
  const moda = await knex('categories').where({ slug: 'moda' }).first();
  const pines = await knex('categories').where({ slug: 'pines' }).first();
  const arte = await knex('categories').where({ slug: 'arte' }).first();

  if (!moda || !pines) {
    // eslint-disable-next-line no-console
    console.warn('[seed] Skipping demo products: run seeds/0001_categories.js first');
    return;
  }

  await knex('products')
    .insert([
      {
        sku: 'DEMO-HOODIE-CLASSIC',
        name: 'Sudadera Classic',
        slug: 'sudadera-classic',
        description: 'Sudadera oversized 100% algodón orgánico con logo ZeroNPC bordado.',
        price_cents: 3800,
        currency: 'EUR',
        stock: 20,
        image_url: '/images/White_Tee.png',
        is_pin: true,
        is_active: true,
        category_id: moda.id,
      },
      {
        sku: 'DEMO-TEE-GHOST',
        name: 'Camiseta Ghost',
        slug: 'camiseta-ghost',
        description: 'Camiseta blanca oversize, serigrafía pearlescente.',
        price_cents: 2200,
        currency: 'EUR',
        stock: 40,
        image_url: '/images/White_Tee.png',
        is_pin: true,
        is_active: true,
        category_id: moda.id,
      },
      {
        sku: 'DEMO-TEE-DEMONIO',
        name: 'Camiseta Demonio',
        slug: 'camiseta-demonio',
        description: 'Camiseta negra oversized con logo neón.',
        price_cents: 2400,
        currency: 'EUR',
        stock: 30,
        image_url: '/images/White_Tee.png',
        is_pin: false,
        is_active: true,
        category_id: moda.id,
      },
      {
        sku: 'DEMO-BAG-ZNPC',
        name: 'Bolsa ZNPC',
        slug: 'bolsa-znpc',
        description: 'Tote bag de algodón reciclado con logo ZeroNPC.',
        price_cents: 1500,
        currency: 'EUR',
        stock: 60,
        image_url: '/images/White_Tee.png',
        is_pin: true,
        is_active: true,
        category_id: moda.id,
      },
      {
        sku: 'DEMO-BAG-ZNPC-BLACK',
        name: 'Bolsa ZNPC Black',
        slug: 'bolsa-znpc-black',
        description: 'Versión negra de nuestra bolsa icónica.',
        price_cents: 1500,
        currency: 'EUR',
        stock: 50,
        image_url: '/images/White_Tee.png',
        is_pin: false,
        is_active: true,
        category_id: moda.id,
      },
      {
        sku: 'DEMO-PIN-BRONZE',
        name: 'Pin Bronze',
        slug: 'pin-bronze',
        description: 'Pin NFC coleccionable de bronce, edición limitada.',
        price_cents: 1200,
        currency: 'EUR',
        stock: 100,
        image_url: '/images/bronce.svg',
        is_pin: true,
        is_active: true,
        category_id: pines.id,
      },
    ])
    .onConflict('sku')
    .ignore();
};
