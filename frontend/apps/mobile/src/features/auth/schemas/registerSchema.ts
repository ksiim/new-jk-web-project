import { z } from 'zod';

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Введите имя и фамилию'),
    email: z.string().min(1, 'Введите email').email('Некорректный email'),
    phone: z
      .string()
      .min(1, 'Введите номер телефона')
      .regex(/^\+?[0-9\s\-()]{10,}$/, 'Некорректный номер'),
    password: z.string().min(6, 'Пароль не короче 6 символов'),
    confirmPassword: z.string().min(1, 'Повторите пароль'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
