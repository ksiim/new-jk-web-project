import { useCallback } from 'react';

import {
  type ProfileExtrasState,
  selectExtrasForUser,
  useProfileExtrasStore,
} from '../../entities/profile/profileExtrasStore';

/** Стабильный selector для zustand + useSyncExternalStore (без новой функции на каждый рендер). */
export function useExtrasForCurrentUser(userId: string | undefined) {
  return useProfileExtrasStore(
    useCallback((s: ProfileExtrasState) => selectExtrasForUser(userId)(s), [userId]),
  );
}
