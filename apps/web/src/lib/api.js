import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: false,
  timeout: 20000,
});

let authTokenGetter = () => null;
let onUnauthorized = () => {};

export function configureApi({ getAccessToken, onUnauthorized: onUnauth }) {
  if (getAccessToken) authTokenGetter = getAccessToken;
  if (onUnauth) onUnauthorized = onUnauth;
}

api.interceptors.request.use((config) => {
  const token = authTokenGetter();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      onUnauthorized();
    }
    return Promise.reject(err);
  },
);

/** Returns the data envelope from the API shape `{ status, data }`. */
export function unwrap(promise) {
  return promise.then((r) => r.data?.data ?? r.data);
}

export default api;
