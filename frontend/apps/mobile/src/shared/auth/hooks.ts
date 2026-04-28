import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchMe, loginRequest, registerRequest } from './api';
import type { LoginPayload, RegisterPayload } from './api';
import { useAuthStore } from '../../entities/auth/authStore';

export function useMe() {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const user = await fetchMe();
      setUser(user);
      return user;
    },
    enabled: Boolean(token),
    staleTime: 60_000,
  });
}

export function useLogin() {
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginRequest(payload),
    onSuccess: async (data) => {
      setToken(data.access_token);
      const user = await queryClient.fetchQuery({
        queryKey: ['auth', 'me'],
        queryFn: fetchMe,
      });
      setUser(user);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerRequest(payload),
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  return () => {
    logout();
    queryClient.clear();
  };
}
