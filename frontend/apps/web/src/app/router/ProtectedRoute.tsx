import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuthStore } from '../../shared/auth/authStore'
import { useLogout, useMe } from '../../shared/auth/hooks'
import { tokens } from '../../shared/theme/tokens'
import { Button } from '../../shared/ui/Button'

type Props = PropsWithChildren<{
  roles?: Array<'user' | 'employee' | 'admin'>
}>

export function ProtectedRoute({ children, roles }: Props) {
  const token = useAuthStore((s) => s.token)
  const location = useLocation()
  const { data: user, isLoading, isError } = useMe()
  const logout = useLogout()

  if (!token) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  if (isLoading) {
    return <div style={{ padding: 24 }}>Загрузка…</div>
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: tokens.color.pageBg,
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 420,
            background: tokens.color.surface,
            borderRadius: tokens.radius.lg,
            border: `1px solid ${tokens.color.border}`,
            padding: 28,
            textAlign: 'center',
            display: 'grid',
            gap: 12,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 20, color: tokens.color.textPrimary }}>
            Доступ только для администраторов
          </h1>
          <p style={{ margin: 0, color: tokens.color.textSecondary }}>
            Ваша учётная запись ({user.email}) не имеет роли «admin». Войдите под админом,
            чтобы продолжить.
          </p>
          <Button onClick={logout}>Выйти</Button>
        </div>
      </main>
    )
  }

  return <>{children}</>
}
