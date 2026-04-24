'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { configureApi, api } from './api';
import { clearCredentials, setCredentials } from '@/store/slices/authSlice';

/**
 * Configures axios with the current access token from Redux.
 * Implements refresh-on-401 using the persisted refreshToken.
 */
export default function ApiBridge() {
  const { accessToken, refreshToken } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    configureApi({
      getAccessToken: () => accessToken,
      onUnauthorized: async () => {
        if (!refreshToken) {
          dispatch(clearCredentials());
          return;
        }
        try {
          const { data } = await api.post('/auth/refresh', { refreshToken });
          if (data?.data?.accessToken) {
            dispatch(setCredentials(data.data));
          }
        } catch {
          dispatch(clearCredentials());
        }
      },
    });
  }, [accessToken, refreshToken, dispatch]);

  return null;
}
