import { useEffect, useState } from 'react';

function getSystemTheme(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getSavedTheme(): boolean | null {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') return true;
  if (saved === 'light') return false;
  return null;
}

export function useTheme() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = getSavedTheme();
    return saved !== null ? saved : getSystemTheme();
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function handleChange(e: MediaQueryListEvent) {
      if (getSavedTheme() === null) {
        setIsDark(e.matches);
      }
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  function toggleTheme() {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  }

  function resetToSystem() {
    localStorage.removeItem('theme');
    setIsDark(getSystemTheme());
  }

  return { isDark, toggleTheme, resetToSystem };
}
