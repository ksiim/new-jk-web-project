import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { extractApiError } from '../shared/api/http'
import { useLogin } from '../shared/auth/hooks'
import { Button } from '../shared/ui/Button'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useLogin()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const redirect = new URLSearchParams(location.search).get('redirect') || '/admin'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await login.mutateAsync({ email, password })
      navigate(redirect, { replace: true })
    } catch {
      /* ошибка отображается через login.error */
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: '48px auto', padding: 24 }}>
      <h1>Вход</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Пароль</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={inputStyle}
          />
        </label>
        {login.isError && (
          <div style={{ color: '#b91c1c' }}>{extractApiError(login.error)}</div>
        )}
        <Button type="submit" disabled={login.isPending}>
          {login.isPending ? 'Входим…' : 'Войти'}
        </Button>
      </form>
      <p style={{ marginTop: 16 }}>
        Нет аккаунта? <Link to="/register">Регистрация</Link>
      </p>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #e5e7eb',
}
