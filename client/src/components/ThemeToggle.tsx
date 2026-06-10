import { useTranslation } from 'react-i18next';
import { useThemeContext } from '../context/ThemeContext';
import { Icons } from './icons/icons';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeContext();

  const { t } = useTranslation();

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center justify-center px-3 py-1.5 rounded-md border transition-colors ${
        isDark
          ? 'border-gray-600 text-gray-400 hover:bg-gray-700'
          : 'border-gray-300 text-gray-500 hover:bg-gray-100'
      }`}
      title={isDark ? t('theme.dark') : t('theme.light')}
    >
      {isDark ? (
        <Icons.moon className="w-4 h-4 text-indigo-400" />
      ) : (
        <Icons.sun className="w-4 h-4 text-amber-500" />
      )}
    </button>
  );
}
