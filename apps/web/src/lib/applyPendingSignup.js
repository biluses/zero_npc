'use client';

import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { usersApi } from '@/services/domainApi';
import { setUser } from '@/store/slices/authSlice';
import { clearSignup } from '@/store/slices/signupSlice';

const STORAGE_AVATAR = 'zero-npc-pending-avatar';
const STORAGE_AVATAR_TYPE = 'zero-npc-pending-avatar-type';

/**
 * Convierte un data URL base64 en un File para enviarlo con FormData.
 */
function dataUrlToFile(dataUrl, mimetype) {
  const arr = dataUrl.split(',');
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8 = new Uint8Array(n);
  while (n--) u8[n] = bstr.charCodeAt(n);
  const ext = mimetype.split('/')[1] || 'jpg';
  return new File([u8], `avatar.${ext}`, { type: mimetype });
}

/**
 * Aplica los datos pendientes del flujo signup tras el primer login.
 * - Ejecuta PATCH /users/me con fullName, dirección, provincia, etc.
 * - Sube el avatar si hay uno guardado como data URL en sessionStorage.
 * - Limpia Redux signup + sessionStorage para que no se aplique de nuevo.
 *
 * Se llama desde Login tras `authApi.login` success y tras `setCredentials`.
 *
 * @param {Object} args
 * @param {Object} args.signup — estado completo del signupSlice
 * @param {Function} args.dispatch — de useDispatch
 * @returns {Promise<boolean>} true si aplicó algo, false si no había pendientes.
 */
export async function applyPendingSignup({ signup, dispatch }) {
  const hasProfileData = Boolean(
    signup?.fullName ||
    signup?.addressLine1 ||
    signup?.postalCode ||
    signup?.province,
  );

  let pendingAvatar = null;
  let pendingAvatarType = null;
  try {
    pendingAvatar = sessionStorage.getItem(STORAGE_AVATAR);
    pendingAvatarType = sessionStorage.getItem(STORAGE_AVATAR_TYPE);
  } catch (_e) {
    // sessionStorage puede estar bloqueado; ignoramos.
  }

  if (!hasProfileData && !pendingAvatar) return false;

  try {
    if (hasProfileData) {
      const res = await usersApi.updateMe({
        fullName: signup.fullName || undefined,
        addressLine1: signup.addressLine1 || undefined,
        addressLine2: signup.addressLine2 || undefined,
        postalCode: signup.postalCode || undefined,
        province: signup.province || undefined,
      });
      if (res) dispatch(setUser(res));
    }

    if (pendingAvatar && pendingAvatarType) {
      const f = dataUrlToFile(pendingAvatar, pendingAvatarType);
      const res = await usersApi.uploadAvatar(f);
      if (res?.user) dispatch(setUser(res.user));
    }
  } catch (err) {
    toast.error('No se pudieron guardar todos los datos del perfil. Puedes editarlos desde tu perfil.');
    // Continúa y limpia igualmente para no reintentar siempre.
  } finally {
    dispatch(clearSignup());
    try {
      sessionStorage.removeItem(STORAGE_AVATAR);
      sessionStorage.removeItem(STORAGE_AVATAR_TYPE);
    } catch (_e) {
      // ignorar
    }
  }

  return true;
}

/**
 * Hook simple para usar en /profile u otras pages que quieran aplicar pendings.
 */
export function useApplyPendingSignup() {
  const dispatch = useDispatch();
  const signup = useSelector((s) => s.signup);
  return () => applyPendingSignup({ signup, dispatch });
}
