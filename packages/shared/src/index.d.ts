// Minimal TS declarations for `@zero-npc/shared`.
// The package itself ships plain CommonJS so no build step is needed.

export type ExchangeStatus =
  | 'pending'
  | 'accepted'
  | 'validated'
  | 'rejected'
  | 'cancelled'
  | 'expired';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type TagType = 'nfc' | 'qr';
export type ScanMethod = 'nfc' | 'qr';
export type UserRole = 'user' | 'admin';
export type LoginType = 'email' | 'google' | 'apple';

export const EXCHANGE_STATUSES: readonly ExchangeStatus[];
export const ORDER_STATUSES: readonly OrderStatus[];
export const TAG_TYPES: readonly TagType[];
export const SCAN_METHODS: readonly ScanMethod[];
export const USER_ROLES: readonly UserRole[];
export const LOGIN_TYPES: readonly LoginType[];

export const DEFAULT_CURRENCY: 'EUR';
export const SUPPORTED_LOCALES: readonly ['es-ES'];
export const DEFAULT_LOCALE: 'es-ES';

// Zod schemas (typed loosely to avoid forcing zod as a peer dep for consumers)
import type { z } from 'zod';
export const emailSchema: z.ZodString;
export const passwordSchema: z.ZodString;
export const uuidSchema: z.ZodString;
export const tagUidSchema: z.ZodString;
export const registerTokenSchema: z.ZodObject<any>;
export const initiateExchangeSchema: z.ZodObject<any>;
export const validateExchangeSchema: z.ZodObject<any>;
export const registerUserSchema: z.ZodObject<any>;
