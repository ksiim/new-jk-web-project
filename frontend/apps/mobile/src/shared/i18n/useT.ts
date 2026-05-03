import { useMemo } from 'react';

import { useSettingsStore } from '../../entities/settings/settingsStore';
import { translate } from './translations';

export function useT() {
  const language = useSettingsStore((s) => s.language);
  return useMemo(() => {
    const t = (key: string) => translate(language, key);
    return { t, language };
  }, [language]);
}
