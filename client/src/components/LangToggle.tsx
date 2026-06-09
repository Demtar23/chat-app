import { useTranslation } from 'react-i18next';
import { useThemeContext } from '../context/ThemeContext';

export function LangToggle() {
  const { t, i18n } = useTranslation();
  const { isDark } = useThemeContext();

  const current = i18n.language.startsWith('uk') ? 'uk' : 'en';

  function toggle() {
    const next = current === 'uk' ? 'en' : 'uk';
    i18n.changeLanguage(next);
    localStorage.setItem('i18nextLng', next);
  }

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border transition-colors ${
        isDark
          ? 'border-gray-600 text-gray-400 hover:bg-gray-700'
          : 'border-gray-300 text-gray-500 hover:bg-gray-100'
      }`}
      title={t('theme.lang')}
    >
      {current.toUpperCase()}
    </button>
  );
}
