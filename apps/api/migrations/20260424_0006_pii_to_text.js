'use strict';

/**
 * Migración: amplía campos PII a TEXT para soportar el cifrado AES-256-GCM.
 *
 * El ciphertext (prefijo `enc:v1:` + IV base64 + auth tag base64 + ciphertext base64)
 * puede exceder VARCHAR(160). TEXT evita ese límite sin impacto de performance (Postgres
 * guarda TEXT igual que VARCHAR, solo difieren en validación de longitud).
 *
 * Campos afectados: full_name, first_name, last_name, address_line1, address_line2,
 * postal_code, province, city.
 *
 * Los datos existentes NO se pierden (varchar → text es seguro). Las próximas escrituras
 * a estas columnas los cifrarán automáticamente vía getters/setters del modelo.
 */

exports.up = async function up(knex) {
  await knex.raw(`
    ALTER TABLE users
      ALTER COLUMN full_name TYPE TEXT,
      ALTER COLUMN first_name TYPE TEXT,
      ALTER COLUMN last_name TYPE TEXT,
      ALTER COLUMN address_line1 TYPE TEXT,
      ALTER COLUMN address_line2 TYPE TEXT,
      ALTER COLUMN postal_code TYPE TEXT,
      ALTER COLUMN province TYPE TEXT,
      ALTER COLUMN city TYPE TEXT
  `);
};

exports.down = async function down(knex) {
  await knex.raw(`
    ALTER TABLE users
      ALTER COLUMN full_name TYPE VARCHAR(120),
      ALTER COLUMN first_name TYPE VARCHAR(64),
      ALTER COLUMN last_name TYPE VARCHAR(64),
      ALTER COLUMN address_line1 TYPE VARCHAR(160),
      ALTER COLUMN address_line2 TYPE VARCHAR(160),
      ALTER COLUMN postal_code TYPE VARCHAR(16),
      ALTER COLUMN province TYPE VARCHAR(80),
      ALTER COLUMN city TYPE VARCHAR(120)
  `);
};
