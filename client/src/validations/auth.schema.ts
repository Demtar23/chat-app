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
  username: z.string().trim().min(1, "Username обов'язковий"),
  password: z.string().min(1, "Пароль обов'язковий"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
