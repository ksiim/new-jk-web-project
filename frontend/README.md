# Mestny Vzglyad Monorepo

Starter repository for MVP development of:
- mobile app (`React Native + Expo`)
- web app (`React + Vite + TypeScript`)
- shared package for common types/constants

## Stack choice for this stage

- **Mobile:** Expo (React Native) for the fastest iOS/Android launch.
- **Web:** React + Vite for quick iteration and clean frontend architecture.
- **Repo:** npm workspaces monorepo for shared code and synchronized setup.

## Project structure

```
mestny-vzglyad/
  apps/
    mobile/   # Expo app
    web/      # React web app
  packages/
    shared/   # common types/constants
```

## Requirements

- Node.js 20+
- npm 10+
- Xcode/Android Studio (for running mobile on simulators/devices)

## First install

From repository root:

```bash
npm install
```

## Run apps

From repository root:

```bash
# web
npm run dev:web

# mobile (Expo)
npm run dev:mobile
```

## Next preparation steps (without feature development)

1. Add design system tokens to `packages/shared`.
2. Prepare API client layer in both apps (without business endpoints).
3. Add route skeletons:
   - Web: public pages + user account + guide account.
   - Mobile: auth, onboarding, map, routes, tours, profile.
4. Add CI checks (lint, typecheck, build).
