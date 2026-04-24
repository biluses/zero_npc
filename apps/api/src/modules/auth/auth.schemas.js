'use strict';

const { z } = require('zod');

const emailSchema = z.string().trim().toLowerCase().email();

// Validación de password reforzada: longitud + al menos letra y número.
// Valores débiles adicionales (blacklist) se validan en el service con
// `validatePasswordStrength` para usar una única fuente de verdad.
const passwordSchema = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .max(128, 'Máximo 128 caracteres')
  .regex(/[A-Za-z]/, 'Debe contener al menos una letra')
  .regex(/\d/, 'Debe contener al menos un número');

// Username: letras, dígitos, underscore y punto. Sin espacios ni símbolos.
const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Mínimo 3 caracteres')
  .max(64, 'Máximo 64 caracteres')
  .regex(/^[A-Za-z0-9_.]+$/, 'Solo letras, números, guión bajo y punto');

// Datos de perfil del paso 2 del signup.
const profileDataSchema = z.object({
  fullName: z.string().trim().min(1, 'Nombre obligatorio').max(120, 'Máximo 120 caracteres'),
  addressLine1: z.string().trim().min(1, 'Dirección obligatoria').max(160),
  addressLine2: z.string().trim().max(160).optional().nullable(),
  postalCode: z.string().trim().regex(/^\d{5}$/, 'Código postal de 5 dígitos'),
  province: z.string().trim().min(1, 'Provincia obligatoria').max(80),
  city: z.string().trim().max(120).optional().nullable(),
});

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema.optional(),
  // Datos de perfil opcionales en el register (se pueden completar después).
  profile: profileDataSchema.partial().optional(),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: z.string().regex(/^\d{4,8}$/),
});

const forgotSchema = z.object({ email: emailSchema });
const resetSchema = z.object({
  email: emailSchema,
  otp: z.string().regex(/^\d{4,8}$/),
  password: passwordSchema,
});

const refreshSchema = z.object({ refreshToken: z.string().min(10) });

// --- Endpoints del flujo signup multi-paso (validación server-side).

const checkEmailSchema = z.object({ email: emailSchema });

// validate-step: objeto con `step` discriminante + datos del paso.
// Usamos union con superRefine (en vez de discriminatedUnion) porque queremos
// aplicar refine cross-field (passwordConfirm match) manteniendo el discriminante.
const step1Schema = z.object({
  step: z.literal(1),
  email: emailSchema,
  password: passwordSchema,
  passwordConfirm: z.string(),
});
const step2Schema = z.object({
  step: z.literal(2),
  fullName: profileDataSchema.shape.fullName,
  addressLine1: profileDataSchema.shape.addressLine1,
  addressLine2: profileDataSchema.shape.addressLine2,
  postalCode: profileDataSchema.shape.postalCode,
  province: profileDataSchema.shape.province,
  city: profileDataSchema.shape.city,
});
const step3Schema = z.object({
  step: z.literal(3),
  avatarMimetype: z.enum(['image/jpeg', 'image/png', 'image/webp']).optional(),
  avatarSizeBytes: z.number().int().positive().max(5 * 1024 * 1024, 'Máximo 5 MB').optional(),
});

const validateStepSchema = z
  .union([step1Schema, step2Schema, step3Schema])
  .superRefine((data, ctx) => {
    if (data.step === 1 && data.password !== data.passwordConfirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Las contraseñas no coinciden',
        path: ['passwordConfirm'],
      });
    }
  });

module.exports = {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  forgotSchema,
  resetSchema,
  refreshSchema,
  checkEmailSchema,
  validateStepSchema,
  passwordSchema,
  profileDataSchema,
};
