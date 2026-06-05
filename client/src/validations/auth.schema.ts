import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username занадто короткий (мін. 3 символи)')
    .max(20, 'Username занадто довгий (макс. 20 символів)')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username може містити тільки літери, цифри, _ та -',
    ),

  email: z.string().trim().email('Invalid email address'),

  password: z
    .string()
    .min(8, 'Пароль має бути мінімум 8 символів')
    .max(64, 'Пароль занадто довгий')
    .regex(/[A-Z]/, 'Пароль має містити хоча б одну велику літеру')
    .regex(/[a-z]/, 'Пароль має містити хоча б одну малу літеру')
    .regex(/[0-9]/, 'Пароль має містити хоча б одну цифру')
    .regex(/[^a-zA-Z0-9]/, 'Пароль має містити хоча б один спецсимвол'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password cannot be empty'),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(64, 'Password must be at most 64 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[^a-zA-Z0-9]/,
        'Password must contain at least one special character',
      ),
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: 'New password must be different from old password',
    path: ['newPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password must be at most 64 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
      /[^a-zA-Z0-9]/,
      'Password must contain at least one special character',
    ),
});

export const setupProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username is too short')
    .max(20, 'Username is too long')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, _ and -',
    ),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
