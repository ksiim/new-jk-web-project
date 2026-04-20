import { tokens } from '../../shared/theme/tokens'

export function KnowledgeBasePage() {
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 22, color: tokens.color.textPrimary }}>База знаний</h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 14,
            color: tokens.color.textSecondary,
            maxWidth: 720,
          }}
        >
          Раздел для статей и FAQ: админ пишет, мобилка показывает. Появится на этапе 3.
        </p>
      </header>

      <div
        style={{
          background: tokens.color.surface,
          border: `1px dashed ${tokens.color.border}`,
          borderRadius: tokens.radius.lg,
          padding: 40,
          textAlign: 'center',
          color: tokens.color.textSecondary,
        }}
      >
        Пусто. Тут будет CRUD-интерфейс статей.
      </div>
    </div>
  )
}
