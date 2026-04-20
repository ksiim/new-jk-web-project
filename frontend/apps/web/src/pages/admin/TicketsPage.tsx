import { tokens } from '../../shared/theme/tokens'
import { ArrowRightIcon } from '../../shared/ui/Icon'

type StatCard = {
  value: number | string
  label: string
  tone?: 'neutral' | 'accent'
}

const stats: StatCard[] = [
  { value: '—', label: 'Всего обращений' },
  { value: '—', label: 'Новые' },
  { value: '—', label: 'В работе' },
  { value: '—', label: 'Решены' },
]

export function TicketsPage() {
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <PageHeader
        title="Обращения"
        description="Список обращений пользователей мобильного приложения. Данные появятся, когда мы подключим ручки бэкенда."
      />

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr)) auto',
          gap: 16,
        }}
      >
        {stats.map((s) => (
          <StatCardView key={s.label} {...s} />
        ))}
        <GoButton />
      </section>

      <EmptyState
        title="Здесь будут обращения"
        description="Создадим таблицу со списком тикетов, фильтрами по статусу и карточкой обращения на этапе 1. Пока это визуальный каркас."
      />
    </div>
  )
}

function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header>
      <h1 style={{ margin: 0, fontSize: 22, color: tokens.color.textPrimary }}>{title}</h1>
      {description ? (
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 14,
            color: tokens.color.textSecondary,
            maxWidth: 720,
          }}
        >
          {description}
        </p>
      ) : null}
    </header>
  )
}

function StatCardView({ value, label }: StatCard) {
  return (
    <div
      style={{
        background: tokens.color.surface,
        border: `1px solid ${tokens.color.border}`,
        borderRadius: tokens.radius.md,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 100,
        boxShadow: tokens.shadow.card,
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 600, color: tokens.color.textPrimary }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: tokens.color.textSecondary }}>{label}</div>
    </div>
  )
}

function GoButton() {
  return (
    <button
      type="button"
      disabled
      title="Появится на этапе 1"
      style={{
        minWidth: 120,
        background: tokens.color.accent,
        color: tokens.color.accentOnDark,
        border: 'none',
        borderRadius: tokens.radius.md,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        minHeight: 100,
        cursor: 'not-allowed',
        opacity: 0.85,
        boxShadow: tokens.shadow.card,
      }}
    >
      <ArrowRightIcon size={24} />
      <span style={{ fontSize: 13 }}>Перейти</span>
    </button>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div
      style={{
        background: tokens.color.surface,
        border: `1px dashed ${tokens.color.border}`,
        borderRadius: tokens.radius.lg,
        padding: 40,
        textAlign: 'center',
        display: 'grid',
        gap: 8,
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 500, color: tokens.color.textPrimary }}>
        {title}
      </div>
      <div style={{ fontSize: 14, color: tokens.color.textSecondary }}>{description}</div>
    </div>
  )
}
