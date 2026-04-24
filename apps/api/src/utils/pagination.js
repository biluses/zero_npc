'use strict';

/**
 * Utilidades de paginación offset/limit + envelope estándar.
 *
 * Convención del MVP API:
 *   - Limit por defecto 20, máximo 100.
 *   - Respuesta: { data: items[], meta: { total, limit, offset, hasMore } }
 */

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Normaliza ?limit y ?offset desde la query string.
 * @param {Object} query — req.query
 * @param {Object} [opts]
 * @returns {{ limit: number, offset: number }}
 */
function parsePagination(query = {}, opts = {}) {
  const defaultLimit = Math.min(Number.isFinite(opts.defaultLimit) ? opts.defaultLimit : DEFAULT_LIMIT, MAX_LIMIT);
  const maxLimit = Math.min(Number.isFinite(opts.maxLimit) ? opts.maxLimit : MAX_LIMIT, MAX_LIMIT);

  let limit = Number.parseInt(query.limit, 10);
  let offset = Number.parseInt(query.offset, 10);

  if (!Number.isFinite(limit) || limit <= 0) limit = defaultLimit;
  limit = Math.min(limit, maxLimit);

  if (!Number.isFinite(offset) || offset < 0) offset = 0;

  return { limit, offset };
}

/**
 * Envelope estándar para respuestas paginadas.
 * @param {Object} args
 * @param {Array} args.rows
 * @param {number} args.count
 * @param {number} args.limit
 * @param {number} args.offset
 * @returns {{ data: Array, meta: { total, limit, offset, hasMore } }}
 */
function paginatedResponse({ rows, count, limit, offset }) {
  return {
    data: rows,
    meta: {
      total: count,
      limit,
      offset,
      hasMore: offset + rows.length < count,
    },
  };
}

module.exports = { parsePagination, paginatedResponse, DEFAULT_LIMIT, MAX_LIMIT };
