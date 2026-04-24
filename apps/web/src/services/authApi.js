import { api, unwrap } from '@/lib/api';

export const authApi = {
  register: (data) => unwrap(api.post('/auth/register', data)),
  verifyOtp: (data) => unwrap(api.post('/auth/verify-otp', data)),
  login: (data) => unwrap(api.post('/auth/login', data)),
  refresh: (refreshToken) => unwrap(api.post('/auth/refresh', { refreshToken })),
  forgot: (email) => unwrap(api.post('/auth/forgot-password', { email })),
  reset: (data) => unwrap(api.post('/auth/reset-password', data)),
  me: () => unwrap(api.get('/auth/me')),

  /**
   * Comprueba si un email está disponible (público, rate-limited).
   * @returns {Promise<{available: boolean}>}
   */
  checkEmail: (email) => unwrap(api.post('/auth/check-email', { email })),

  /**
   * Valida un paso del signup en el servidor antes de avanzar.
   * Lanza error con response.data.details = [{path, message}, ...] si falla validación.
   * @param {Object} data — { step: 1|2|3, ...campos }
   */
  validateStep: (data) => unwrap(api.post('/auth/validate-step', data)),
};
