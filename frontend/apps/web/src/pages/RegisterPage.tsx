import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { extractApiError } from '../shared/api/http'
import { useLogin, useRegister } from '../shared/auth/hooks'
import { Button } from '../shared/ui/Button'

export function RegisterPage() {
  const navigate = useNavigate()
  const register = useRegister()
  const login = useLogin()

  const [form, setForm] = useState({
    name: '',
    surname: '',
    patronymic: '',
    email: '',
    password: '',
    date_of_birth: '',
  })

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }))

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await register.mutateAsync({
        name: form.name,
        surname: form.surname,
        patronymic: form.patronymic || null,
        email: form.email,
        password: form.password,
        date_of_birth: form.date_of_birth,
      })
      await login.mutateAsync({ email: form.email, password: form.password })
      navigate('/admin', { replace: true })
    } catch {
      /* ошибки отображаются ниже */
    }
  }

  const error = register.error ?? login.error
  const isPending = register.isPending || login.isPending

  return (
    <main style={{ maxWidth: 480, margin: '48px auto', padding: 24 }}>
      <h1>Регистрация</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <label style={labelStyle}>
          <span>Имя</span>
          <input required value={form.name} onChange={update('name')} style={inputStyle} />
        </label>
        <label style={labelStyle}>
          <span>Фамилия</span>
          <input required value={form.surname} onChange={update('surname')} style={inputStyle} />
        </label>
        <label style={labelStyle}>
          <span>Отчество (необязательно)</span>
          <input value={form.patronymic} onChange={update('patronymic')} style={inputStyle} />
        </label>
        <label style={labelStyle}>
          <span>Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={update('email')}
            style={inputStyle}
          />
        </label>
        <label style={labelStyle}>
          <span>Дата рождения</span>
          <input
            type="date"
            required
            value={form.date_of_birth}
            onChange={update('date_of_birth')}
            style={inputStyle}
          />
        </label>
        <label style={labelStyle}>
          <span>Пароль</span>
          <input
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            value={form.password}
            onChange={update('password')}
            style={inputStyle}
          />
        </label>
        {error && <div style={{ color: '#b91c1c' }}>{extractApiError(error)}</div>}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Создаём…' : 'Создать аккаунт'}
        </Button>
      </form>
      <p style={{ marginTop: 16 }}>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </main>
  )
}

const labelStyle: React.CSSProperties = { display: 'grid', gap: 4 }
const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #e5e7eb',
}
