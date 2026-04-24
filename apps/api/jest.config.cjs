'use strict';

/**
 * Jest config para @zero-npc/api.
 *
 * - Tests viven en `tests/` (separados de src/).
 * - setup.js se ejecuta una vez antes del suite (carga env test + crea conexión).
 * - detectOpenHandles ayuda a diagnosticar fugas de conexiones.
 * - testTimeout generoso para permitir transacciones + setup/teardown.
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['<rootDir>/tests/setup-env.js'],
  setupFilesAfterEach: [],
  testTimeout: 20000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
};
