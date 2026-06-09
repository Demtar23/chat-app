import { useTranslation } from 'react-i18next';
import { useThemeContext } from '../../../context/ThemeContext';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeContext();

  const { t } = useTranslation();

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border transition-colors ${
        isDark
          ? 'border-gray-600 text-gray-400 hover:bg-gray-700'
          : 'border-gray-300 text-gray-500 hover:bg-gray-100'
      }`}
      title={t('theme.toggleTitle')}
    >
      {isDark ? `🌙 ${t('theme.dark')}` : `☀️ ${t('theme.light')}`}
    </button>
  );
}
