import { useAuthStore } from '../../shared/auth/authStore'
import { tokens } from '../../shared/theme/tokens'

export function SettingsPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 22, color: tokens.color.textPrimary }}>Настройки</h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 14,
            color: tokens.color.textSecondary,
            maxWidth: 720,
          }}
        >
          Профиль администратора и общие настройки приложения. Расширим на этапе 3.
        </p>
      </header>

      <section
        style={{
          background: tokens.color.surface,
          border: `1px solid ${tokens.color.border}`,
          borderRadius: tokens.radius.md,
          padding: 24,
          display: 'grid',
          gap: 12,
          maxWidth: 520,
          boxShadow: tokens.shadow.card,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 15, color: tokens.color.textPrimary }}>
          Текущий администратор
        </h2>
        {user ? (
          <dl style={{ margin: 0, display: 'grid', gap: 8 }}>
            <Row label="Имя" value={`${user.surname} ${user.name}`.trim()} />
            <Row label="Email" value={user.email} />
            <Row label="Роль" value={user.role} />
          </dl>
        ) : (
          <span style={{ color: tokens.color.textSecondary }}>Загрузка…</span>
        )}
      </section>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <dt style={{ color: tokens.color.textSecondary, fontSize: 13 }}>{label}</dt>
      <dd style={{ margin: 0, color: tokens.color.textPrimary, fontSize: 13 }}>{value}</dd>
    </div>
  )
}
