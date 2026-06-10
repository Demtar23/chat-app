import LottieImport from 'lottie-react';
import cat404 from '../assets/cat404.json';
import { Link } from 'react-router-dom';
import { useThemeContext } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import { ThemeToggle } from '../components/ThemeToggle';
import { LangToggle } from '../components/LangToggle';
import { useTranslation } from 'react-i18next';

const Lottie =
  (LottieImport as { default?: typeof LottieImport }).default ?? LottieImport;

export default function NotFoundPage() {
  const { t } = useTranslation();
  const { isDark } = useThemeContext();
  const theme = getTheme(isDark);

  return (
    <div
      className={`relative min-h-screen flex flex-col items-center justify-center px-4 ${theme.bgPrimary} ${theme.textPrimary}`}
    >
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LangToggle />
        <ThemeToggle />
      </div>

      <div className="w-[280px] sm:w-[360px] drop-shadow-2xl">
        <Lottie animationData={cat404} loop />
      </div>

      <div className="text-center mt-2">
        <h1 className="text-7xl font-black text-[#5865f2] tracking-tight">
          404
        </h1>
        <h2 className={`text-xl font-semibold mt-2 ${theme.textPrimary}`}>
          {t('notFound.title')}
        </h2>
        <p
          className={`mt-2 text-sm max-w-xs mx-auto leading-relaxed ${theme.textMuted}`}
        >
          {t('notFound.desc')}
        </p>
      </div>

      <Link
        to="/chat"
        className="mt-8 px-6 py-3 rounded-xl bg-[#5865f2] hover:bg-[#4752c4] active:scale-95 transition-all duration-150 text-sm font-medium text-white shadow-lg shadow-[#5865f2]/20"
      >
        {t('notFound.backBtn')}
      </Link>

      <p className={`text-xs mt-6 ${theme.textFaintest}`}>
        {t('notFound.hint')}
      </p>
    </div>
  );
}
