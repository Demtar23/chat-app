export type ThemeTokens = {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgHover: string;
  bgActive: string;
  bgInput: string;
  bgMessage: string;
  bgOverlay: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textFaint: string;
  textFaintest: string;
  border: string;
  borderColor: string;
  brand: string;
  brandHover: string;
  brandText: string;
  brandBorder: string;
  iconDefault: string;
  iconHover: string;
};

export const theme: { dark: ThemeTokens; light: ThemeTokens } = {
  dark: {
    bgPrimary: 'bg-[#1a1d24]',
    bgSecondary: 'bg-[#23272f]',
    bgTertiary: 'bg-[#2b3038]',

    bgHover: 'hover:bg-[#353b45]',
    bgActive: 'bg-[#404854]',

    bgInput: 'bg-[#20242c]',
    bgMessage: 'bg-[#2a2f38]',
    bgOverlay: 'bg-[#1a1d24]',

    textPrimary: 'text-[#f2f3f5]',
    textSecondary: 'text-[#dbdee1]',
    textMuted: 'text-[#a3a6aa]',
    textFaint: 'text-[#7d8187]',
    textFaintest: 'text-[#62656b]',

    border: 'border-[#31363f]',
    borderColor: '#31363f',

    brand: 'bg-[#5865f2]',
    brandHover: 'hover:bg-[#4752c4]',
    brandText: 'text-[#5865f2]',
    brandBorder: 'border-[#5865f2]',

    iconDefault: 'text-[#a3a6aa]',
    iconHover: 'hover:text-[#5865f2]',
  },

  light: {
    bgPrimary: 'bg-[#f5f6f8]',
    bgSecondary: 'bg-[#eceff3]',
    bgTertiary: 'bg-[#ffffff]',

    bgHover: 'hover:bg-[#e4e7eb]',
    bgActive: 'bg-[#d8dde3]',

    bgInput: 'bg-[#f1f3f5]',
    bgMessage: 'bg-[#ffffff]',
    bgOverlay: 'bg-[#f5f6f8]',

    textPrimary: 'text-[#1f2328]',
    textSecondary: 'text-[#4b5563]',
    textMuted: 'text-[#6b7280]',
    textFaint: 'text-[#9ca3af]',
    textFaintest: 'text-[#c0c4cc]',

    border: 'border-[#d8dde3]',
    borderColor: '#d8dde3',

    brand: 'bg-[#5865f2]',
    brandHover: 'hover:bg-[#4752c4]',
    brandText: 'text-[#5865f2]',
    brandBorder: 'border-[#5865f2]',

    iconDefault: 'text-[#6b7280]',
    iconHover: 'hover:text-[#5865f2]',
  },
};

export function getTheme(isDark: boolean): ThemeTokens {
  return isDark ? theme.dark : theme.light;
}
