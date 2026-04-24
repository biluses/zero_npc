import { api, unwrap, unwrapPaginated } from '@/lib/api';

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
  updateMe: (data) => unwrap(api.patch('/users/me', data)),
  uploadAvatar: (file) => {
    const fd = new FormData();
    fd.append('avatar', file);
    return unwrap(
      api.post('/users/me/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
  },
};

export const postsApi = {
  list: (params = {}) => unwrapPaginated(api.get('/posts', { params })),
  byId: (id) => unwrap(api.get(`/posts/${id}`)),
  create: ({ caption, withUserId, image }) => {
    const fd = new FormData();
    if (caption) fd.append('caption', caption);
    if (withUserId) fd.append('withUserId', withUserId);
    if (image) fd.append('image', image);
    return unwrap(
      api.post('/posts', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
  },
  update: (id, data) => unwrap(api.patch(`/posts/${id}`, data)),
  remove: (id) => unwrap(api.delete(`/posts/${id}`)),
  like: (id) => unwrap(api.post(`/posts/${id}/like`)),
  comments: (id) => unwrap(api.get(`/posts/${id}/comments`)),
  addComment: (id, data) => unwrap(api.post(`/posts/${id}/comments`, data)),
};

export const friendsApi = {
  list: (params = {}) => unwrapPaginated(api.get('/friends', { params })),
  requests: (type = 'incoming') => unwrapPaginated(api.get('/friends/requests', { params: { type } })),
  discover: (params = {}) => unwrapPaginated(api.get('/friends/discover', { params })),
  request: (userId) => unwrap(api.post(`/friends/request/${userId}`)),
  accept: (userId) => unwrap(api.post(`/friends/accept/${userId}`)),
  reject: (userId) => unwrap(api.post(`/friends/reject/${userId}`)),
  remove: (userId) => unwrap(api.delete(`/friends/${userId}`)),
};

export const notificationsApi = {
  list: (params = {}) => unwrapPaginated(api.get('/notifications', { params })),
  unreadCount: () => unwrap(api.get('/notifications/unread-count')),
  markRead: (id) => unwrap(api.patch(`/notifications/${id}/read`)),
  markAllRead: () => unwrap(api.patch('/notifications/read-all')),
};

export const policyApi = {
  get: (type) => unwrap(api.get(`/policies/${type}`)),
};
