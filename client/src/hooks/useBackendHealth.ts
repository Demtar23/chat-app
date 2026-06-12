import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;
const POLL_INTERVAL = 4000;

type Status = 'loading' | 'ready' | 'error';

export function useBackendHealth() {
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    async function check() {
      try {
        const res = await fetch(`${API_URL}/health`, {
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          if (!cancelled) setStatus('ready');
          return;
        }
      // eslint-disable-next-line no-empty
      } catch {}

      if (!cancelled) {
        timeoutId = setTimeout(check, POLL_INTERVAL);
      }
    }

    check();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return status;
}
