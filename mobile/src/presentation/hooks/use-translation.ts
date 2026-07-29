import { useCallback } from 'react';

import { t as translate } from '@/core/infra/i18n';

export function useTranslation() {
  const t = useCallback(
    (scope: string, options?: Record<string, string | number>) => translate(scope, options),
    []
  );

  return { t };
}
