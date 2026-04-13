import { z } from 'zod';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9\s\-()]{10,}$/;

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Введите email или телефон')
    .refine(
      (val) => {
        const trimmed = val.trim();
        return emailRegex.test(trimmed) || phoneRegex.test(trimmed.replace(/\s/g, ''));
      },
      { message: 'Некорректный email или номер телефона' },
    ),
  password: z.string().min(6, 'Минимум 6 символов'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
