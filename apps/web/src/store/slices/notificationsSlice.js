import { createSlice } from '@reduxjs/toolkit';

/**
 * Estado global de notificaciones (badge en bell + ack en tiempo real).
 * El detalle (lista completa) se renderiza en /notifications llamando al endpoint;
 * este slice solo mantiene el contador para que el badge se actualice instantáneamente
 * vía socket evento `notification:new` sin tener que pedir al backend.
 */
const initialState = {
  unreadCount: 0,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setUnreadCount(state, action) {
      state.unreadCount = Math.max(0, Number(action.payload) || 0);
    },
    incrementUnread(state) {
      state.unreadCount += 1;
    },
    markAllRead(state) {
      state.unreadCount = 0;
    },
  },
});

export const { setUnreadCount, incrementUnread, markAllRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
