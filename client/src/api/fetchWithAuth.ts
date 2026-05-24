import { notify } from '../utils/toast';
import { apiRefresh } from './auth.api';

type RefreshCallback = (newToken: string) => void;

let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

// глобальний callback — встановлюється з AuthContext
let onTokenRefreshed: RefreshCallback | null = null;

export function setTokenRefreshCallback(cb: RefreshCallback) {
  onTokenRefreshed = cb;
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  token: string,
): Promise<Response> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    Authorization: `Bearer ${token}`,
  };

  // автоматично додаємо Content-Type якщо є body
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status !== 401) return res;

  if (!isRefreshing) {
    isRefreshing = true;
    try {
      const { accessToken: newToken } = await apiRefresh();
      onTokenRefreshed?.(newToken);
      pendingRequests.forEach((resolve) => resolve(newToken));
      pendingRequests = [];

      // повторяємо з новим токеном
      return fetch(url, {
        ...options,
        headers: {
          ...headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
    } catch {
      pendingRequests = [];
      notify.error('Сесія закінчилась. Виконується вихід...');
      window.location.href = '/login';
      throw new Error('Session expired');
    } finally {
      isRefreshing = false;
    }
  }

  return new Promise((resolve) => {
    pendingRequests.push((newToken: string) => {
      resolve(
        fetch(url, {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          },
        }),
      );
    });
  });
}
