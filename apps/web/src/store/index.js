'use client';

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import authReducer from './slices/authSlice';
import signupReducer from './slices/signupSlice';
import notificationsReducer from './slices/notificationsSlice';
import presenceReducer from './slices/presenceSlice';

function createNoopStorage() {
  return {
    getItem: () => Promise.resolve(null),
    setItem: (_k, v) => Promise.resolve(v),
    removeItem: () => Promise.resolve(),
  };
}

const storage =
  typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage();

const rootReducer = combineReducers({
  auth: authReducer,
  signup: signupReducer,
  notifications: notificationsReducer,
  presence: presenceReducer,
});

const persistConfig = {
  key: 'zero-npc',
  storage,
  // signup se persiste para que la navegación entre pasos (paso-1 → paso-2 → paso-3)
  // no pierda datos. Se limpia con clearSignup al completar o cancelar el flujo.
  whitelist: ['auth', 'signup'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
