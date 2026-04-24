'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from 'react-hot-toast';
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
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: '#22222d', color: '#fff', border: '1px solid #2e2e3b' },
          }}
        />
      </PersistGate>
    </Provider>
  );
}
