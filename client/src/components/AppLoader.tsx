import LottieImport from 'lottie-react';
import loadingAnimation from '../assets/loading_animation.json';

/** CJS interop (Vite + main): default — це namespace, компонент — у .default */
const Lottie =
  (LottieImport as { default?: typeof LottieImport }).default ?? LottieImport;

type Variant = 'fullscreen' | 'overlay';

type Props = {
  label?: string;
  isDark?: boolean;
  /** fullscreen — весь екран; overlay — поверх контейнера (батько position: relative) */
  variant?: Variant;
  className?: string;
};

const SIZES = { fullscreen: 168, overlay: 128 } as const;

export function AppLoader({
  label,
  isDark = true,
  variant = 'fullscreen',
  className = '',
}: Props) {
  const size = SIZES[variant];
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';

  const body = (
    <div
      className="flex flex-col items-center justify-center gap-3"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label ?? 'Завантаження'}
    >
      <Lottie
        animationData={loadingAnimation}
        loop
        className="pointer-events-none scale-200"
        style={{ width: size, height: size }}
      />
      {label ? (
        <p
          className={`text-sm font-medium text-center max-w-[16rem] ${textMuted}`}
        >
          {label}
        </p>
      ) : null}
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
      className={`h-screen w-full flex items-center justify-center transition-colors duration-200 ${
        isDark ? 'bg-[#1e1f22]' : 'bg-gray-50'
      } ${className}`}
    >
      {body}
    </div>
  );
}
