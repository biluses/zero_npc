import { createSlice } from '@reduxjs/toolkit';

/**
 * Estado de presencia online.
 * Mantiene un array de userIds online recibido por socket `users:online`.
 * El evento emite la lista COMPLETA cada vez que alguien entra o sale —
 * el estado se reemplaza íntegramente (idempotente, sin race conditions).
 *
 * Uso en componentes:
 *   const online = useSelector((s) => s.presence.online);
 *   const isOnline = online.includes(userId);
 */
const initialState = {
  online: [],
};

const presenceSlice = createSlice({
  name: 'presence',
  initialState,
  reducers: {
    setOnline(state, action) {
      state.online = Array.isArray(action.payload) ? action.payload : [];
    },
    clearPresence(state) {
      state.online = [];
    },
  },
});

export const { setOnline, clearPresence } = presenceSlice.actions;

export const selectIsOnline = (userId) => (state) => {
  if (!userId) return false;
  return state.presence.online.includes(userId);
};

export default presenceSlice.reducer;
