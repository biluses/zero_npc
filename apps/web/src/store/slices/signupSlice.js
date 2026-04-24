import { createSlice } from '@reduxjs/toolkit';

/**
 * Estado temporal del flujo de registro multi-paso (XD: Signup – 1/2/3).
 * Persiste solo durante el flujo en sesión (no se persiste en localStorage).
 *
 * Paso 1: email + password
 * Paso 2: nombre + dirección de envío
 * Paso 3: avatar (foto opcional)
 *
 * Tras éxito en /signup/paso-3, se llama `clearSignup()` y se limpian todos los datos.
 */

const initialState = {
  email: '',
  password: '',
  username: '',
  fullName: '',
  addressLine1: '',
  addressLine2: '',
  postalCode: '',
  province: '',
  avatarPreviewUrl: null,
  // Dirección de la última navegación para animar las transiciones entre pasos.
  // 'forward' al ir 1→2 o 2→3; 'back' al volver 3→2 o 2→1; 'initial' al entrar.
  direction: 'initial',
};

const signupSlice = createSlice({
  name: 'signup',
  initialState,
  reducers: {
    setStep1(state, action) {
      const { email, password, username } = action.payload;
      state.email = (email || '').trim().toLowerCase();
      state.password = password || '';
      state.username = (username || '').trim();
    },
    setStep2(state, action) {
      const { fullName, addressLine1, addressLine2, postalCode, province } = action.payload;
      state.fullName = (fullName || '').trim();
      state.addressLine1 = (addressLine1 || '').trim();
      state.addressLine2 = (addressLine2 || '').trim();
      state.postalCode = (postalCode || '').trim();
      state.province = (province || '').trim();
    },
    setAvatarPreview(state, action) {
      state.avatarPreviewUrl = action.payload || null;
    },
    setDirection(state, action) {
      state.direction = action.payload || 'forward';
    },
    clearSignup() {
      return initialState;
    },
  },
});

export const {
  setStep1,
  setStep2,
  setAvatarPreview,
  setDirection,
  clearSignup,
} = signupSlice.actions;
export default signupSlice.reducer;
