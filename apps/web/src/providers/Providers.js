'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ToastContainer } from 'react-toastify';
import { store, persistor } from '@/store';
import SocketBridge from './SocketBridge';
import ApiBridge from '@/lib/ApiBridge';

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ApiBridge />
        <SocketBridge />
        {children}
        <ToastContainer
          position="top-center"
          autoClose={3500}
          newestOnTop
          closeOnClick
          theme="light"
          toastClassName="!rounded-2xl"
        />
      </PersistGate>
    </Provider>
  );
}
