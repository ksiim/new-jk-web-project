import { z } from 'zod';

const phoneRegex = /^[\+\d][\d\s\-()]{9,19}$/;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Введите фамилию и имя')
      .refine(
        (value) => value.trim().split(/\s+/).filter(Boolean).length >= 2,
        'Укажите фамилию и имя через пробел',
      ),
    phone: z
      .string()
      .min(1, 'Введите телефон')
      .regex(phoneRegex, 'Некорректный номер'),
    email: z.string().min(1, 'Введите email').email('Некорректный email'),
    password: z.string().min(8, 'Слишком короткий пароль'),
    confirmPassword: z.string().min(1, 'Повторите пароль'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * Разбивает «Фамилия Имя [Отчество ...]» в отдельные поля для бэка.
 */
export function splitFullName(fullName: string): {
  surname: string;
  name: string;
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const [surname = '', ...rest] = parts;
  return { surname, name: rest.join(' ') };
}
