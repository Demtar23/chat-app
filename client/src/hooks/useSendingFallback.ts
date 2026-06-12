import { useCallback, useEffect, useRef, useState } from 'react';

export function useSendingFallback() {
  const [isSending, setIsSending] = useState(false);
  const sendingFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSendingFallback = useCallback(() => {
    if (sendingFallbackRef.current) {
      clearTimeout(sendingFallbackRef.current);
      sendingFallbackRef.current = null;
    }
  }, []);

  const startSendingFallback = useCallback(() => {
    clearSendingFallback();
    setIsSending(true);
    sendingFallbackRef.current = setTimeout(() => {
      setIsSending(false);
      sendingFallbackRef.current = null;
    }, 2500);
  }, [clearSendingFallback]);

  useEffect(() => () => clearSendingFallback(), [clearSendingFallback]);

  return {
    isSending,
    setIsSending,
    clearSendingFallback,
    startSendingFallback,
  };
}
