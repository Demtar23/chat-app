import LottieImport from 'lottie-react';
import loadingAnimation from '../assets/loading_animation.json';
import { getTheme } from '../styles/theme';
import { useThemeContext } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const Lottie =
  (LottieImport as { default?: typeof LottieImport }).default ?? LottieImport;

type Variant = 'fullscreen' | 'overlay';

type Props = {
  label?: string;
  variant?: Variant;
  className?: string;
};

const SIZES = { fullscreen: 168, overlay: 128 } as const;

export function AppLoader({
  label,
  variant = 'fullscreen',
  className = '',
}: Props) {
  const { isDark } = useThemeContext();
  const theme = getTheme(isDark);
  const { t } = useTranslation();
  const size = SIZES[variant];

  const body = (
    <div
      className="flex flex-col items-center justify-center gap-3"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label ?? t('messages.loading')}
    >
      <Lottie
        animationData={loadingAnimation}
        loop
        className="pointer-events-none scale-200"
        style={{ width: size, height: size }}
      />
      {label && (
        <p
          className={`text-sm font-medium text-center max-w-[16rem] ${theme.textMuted}`}
        >
          {label}
        </p>
      )}
    </div>
  );

  if (variant === 'overlay') {
    return (
      <div
        className={`absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[2px] transition-opacity duration-200 ${
          isDark ? 'bg-[#1e1f22]/88' : 'bg-white/90'
        } ${className}`}
      >
        {body}
      </div>
    );
  }

  return (
    <div
      className={`h-screen w-full flex items-center justify-center transition-colors duration-200 ${theme.bgPrimary} ${className}`}
    >
      {body}
    </div>
  );
}
