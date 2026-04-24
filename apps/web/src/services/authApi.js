import { api, unwrap } from '@/lib/api';

export const authApi = {
  register: (data) => unwrap(api.post('/auth/register', data)),
  verifyOtp: (data) => unwrap(api.post('/auth/verify-otp', data)),
  login: (data) => unwrap(api.post('/auth/login', data)),
  refresh: (refreshToken) => unwrap(api.post('/auth/refresh', { refreshToken })),
  forgot: (email) => unwrap(api.post('/auth/forgot-password', { email })),
  reset: (data) => unwrap(api.post('/auth/reset-password', data)),
  me: () => unwrap(api.get('/auth/me')),
};
