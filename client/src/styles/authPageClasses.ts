import { getTheme } from './theme';

export function getAuthPage(isDark: boolean) {
  const t = getTheme(isDark);

  return {
    page: `h-screen flex flex-col items-center justify-center ${t.bgPrimary}`,
    card: `${t.bgSecondary} ${t.border} rounded-lg p-8 w-full max-w-sm border`,
    cardCenter: `${t.bgSecondary} ${t.border} rounded-lg p-8 w-full max-w-sm border text-center`,
    title: `${t.textPrimary} text-xl font-medium mb-1`,
    subtitle: `${t.textMuted} text-sm mb-6`,
    label: `text-xs font-medium ${t.textMuted} tracking-wide`,
    input: (error?: string) =>
      `${t.bgInput} ${t.textPrimary} text-sm px-3 py-2.5 rounded-md outline-none border transition-colors w-full ${
        error
          ? 'border-red-500 focus:border-red-400'
          : `border-transparent focus:${t.brandBorder}`
      }`,
    submitBtn: `${t.brand} ${t.brandHover} disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-md transition-colors w-full`,
    link: `${t.brandText} hover:underline`,
    mutedText: `${t.textFaint} text-sm mt-4 text-center`,
    divider: {
      wrapper: 'relative my-5',
      line: 'absolute inset-0 flex items-center',
      lineInner: `w-full border-t ${t.bgDivider}`,
      label: 'relative flex justify-center',
      labelInner: `px-2 text-xs ${t.bgSecondary} ${t.textFaint}`,
    },
    googleBtn: `flex items-center justify-center gap-3 w-full py-2.5 rounded-md border transition-colors text-sm font-medium ${t.border} ${t.textSecondary} ${t.bgHover}`,
  };
}
