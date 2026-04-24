import { api, unwrap } from '@/lib/api';

export const tokensApi = {
  list: () => unwrap(api.get('/tokens')),
  byId: (id) => unwrap(api.get(`/tokens/${id}`)),
  register: (data) => unwrap(api.post('/tokens/register', data)),
  lookup: (tagUid) => unwrap(api.get('/tokens/lookup', { params: { tagUid } })),
};

export const exchangesApi = {
  list: (box = 'inbox') => unwrap(api.get('/exchanges', { params: { box } })),
  initiate: (data) => unwrap(api.post('/exchanges/initiate', data)),
  respond: (id, action) => unwrap(api.post(`/exchanges/${id}/respond`, { action })),
  validate: (id, data) => unwrap(api.post(`/exchanges/${id}/validate`, data)),
  cancel: (id) => unwrap(api.post(`/exchanges/${id}/cancel`)),
};

export const productsApi = {
  list: (params) => unwrap(api.get('/products', { params })),
  byId: (id) => unwrap(api.get(`/products/${id}`)),
  categories: () => unwrap(api.get('/products/categories')),
};

export const shopApi = {
  checkout: (data) => unwrap(api.post('/shop/checkout', data)),
  orders: () => unwrap(api.get('/shop/orders')),
};

export const chatApi = {
  threads: () => unwrap(api.get('/chat/threads')),
  messages: (otherId, before) =>
    unwrap(api.get(`/chat/messages/${otherId}`, { params: before ? { before } : {} })),
  send: (data) => unwrap(api.post('/chat/messages', data)),
};

export const usersApi = {
  search: (q) => unwrap(api.get('/users/search', { params: { q } })),
  byId: (id) => unwrap(api.get(`/users/${id}`)),
};
