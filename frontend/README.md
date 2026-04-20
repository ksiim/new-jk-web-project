# Mestny Vzglyad Monorepo

Стартовый фронтенд-репозиторий для разработки MVP:
- мобильное приложение (`React Native + Expo`)
- веб-приложение (`React + Vite + TypeScript`)
- общий пакет для переиспользуемых типов и констант

## Выбор стека на текущем этапе

- **Mobile:** Expo (React Native) для максимально быстрого старта на iOS/Android.
- **Web:** React + Vite для быстрой итерации и чистой архитектуры фронтенда.
- **Repo:** монорепозиторий на npm workspaces для общей структуры и синхронной разработки.

## Структура проекта

```
frontend/
  apps/
    mobile/   # Expo-приложение
    web/      # React web-приложение
```

## Требования

- Node.js 20+
- npm 10+
- Xcode/Android Studio (для запуска мобильного приложения на симуляторах/устройствах)

## Первая установка

Из корня `frontend`:

```bash
npm install
```

## Запуск приложений

Из корня `frontend`:

```bash
# web
npm run dev:web

# mobile (Expo)
npm run dev:mobile
```
