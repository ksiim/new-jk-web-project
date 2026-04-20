import { tokens } from '../../shared/theme/tokens'

const plannedMetrics = [
  {
    title: 'Сессии',
    description: 'DAU/WAU, средняя длительность сессии, график по дням.',
  },
  {
    title: 'Экраны',
    description: 'Счётчики просмотров экранов: главная, карта, маршруты, профиль.',
  },
  {
    title: 'Маршруты',
    description: 'Сколько маршрутов сгенерировано, топ стартовых точек, время до первого маршрута.',
  },
  {
    title: 'Воронка',
    description: 'Карта → применил фильтр → построил маршрут. Где юзеры отваливаются.',
  },
]

export function AnalyticsPage() {
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 22, color: tokens.color.textPrimary }}>Аналитика</h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 14,
            color: tokens.color.textSecondary,
            maxWidth: 720,
          }}
        >
          На этапе 2 подключим сбор событий с мобилки и построим графики. Ниже — что планируем
          трекать.
        </p>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
        }}
      >
        {plannedMetrics.map((m) => (
          <article
            key={m.title}
            style={{
              background: tokens.color.surface,
              border: `1px solid ${tokens.color.border}`,
              borderRadius: tokens.radius.md,
              padding: 20,
              display: 'grid',
              gap: 8,
              boxShadow: tokens.shadow.card,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 15, color: tokens.color.textPrimary }}>
              {m.title}
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: tokens.color.textSecondary }}>
              {m.description}
            </p>
          </article>
        ))}
      </section>
    </div>
  )
}
