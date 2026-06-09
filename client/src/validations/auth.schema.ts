import { t } from 'i18next';
import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, t('validation.usernameTooShort'))
    .max(20, t('validation.usernameTooLong'))
    .regex(/^[a-zA-Z0-9_-]+$/, t('validation.usernameInvalid')),

  email: z.string().trim().email(t('validation.emailInvalid')),

  password: z
    .string()
    .min(8, t('validation.passwordTooShort'))
    .max(64, t('validation.passwordTooLong'))
    .regex(/[A-Z]/, t('validation.passwordUpperCase'))
    .regex(/[a-z]/, t('validation.passwordLowerCase'))
    .regex(/[0-9]/, t('validation.passwordNumber'))
    .regex(/[^a-zA-Z0-9]/, t('validation.passwordSpecial')),
});

export const loginSchema = z.object({
  email: z.string().trim().email(t('validation.emailInvalid')),
  password: z.string().min(1, t('validation.passwordEmpty')),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, t('validation.oldPasswordRequired')),
    newPassword: z
      .string()
      .min(8, t('validation.passwordTooShort'))
      .max(64, t('validation.passwordTooLong'))
      .regex(/[A-Z]/, t('validation.passwordUpperCase'))
      .regex(/[a-z]/, t('validation.passwordLowerCase'))
      .regex(/[0-9]/, t('validation.passwordNumber'))
      .regex(/[^a-zA-Z0-9]/, t('validation.passwordSpecial')),
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: t('validation.passwordMismatch'),
    path: ['newPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(t('validation.emailInvalid')),
});

export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, t('validation.passwordTooShort'))
    .max(64, t('validation.passwordTooLong'))
    .regex(/[A-Z]/, t('validation.passwordUpperCase'))
    .regex(/[a-z]/, t('validation.passwordLowerCase'))
    .regex(/[0-9]/, t('validation.passwordNumber'))
    .regex(/[^a-zA-Z0-9]/, t('validation.passwordSpecial')),
});

export const setupProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, t('validation.usernameTooShort'))
    .max(20, t('validation.usernameTooLong'))
    .regex(/^[a-zA-Z0-9_-]+$/, t('validation.usernameInvalid')),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
