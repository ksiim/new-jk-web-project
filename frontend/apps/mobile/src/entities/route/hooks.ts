import { useMutation } from '@tanstack/react-query';

import { generateRoute } from './api';

export function useGenerateRoute() {
  return useMutation({
    mutationFn: generateRoute,
  });
}
