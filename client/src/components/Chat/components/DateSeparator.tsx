import { getTheme } from '../../../styles/theme';
import { useTranslation } from 'react-i18next';

function formatDateSeparator(date: string, locale: string): string {
  const d = new Date(date);
  const now = new Date();

  const diff = Math.floor(
    (now.setHours(0, 0, 0, 0) - d.setHours(0, 0, 0, 0)) / 86400000,
  );

  if (diff === 0) return 'today';
  if (diff === 1) return 'yesterday';

  if (diff < 7) {
    return d.toLocaleDateString(locale, { weekday: 'long' });
  }

  return d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: diff > 365 ? 'numeric' : undefined,
  });
}

export function DateSeparator({
  date,
  isDark,
}: {
  date: string;
  isDark: boolean;
}) {
  const { t, i18n } = useTranslation();
  const theme = getTheme(isDark);

  const raw = formatDateSeparator(date, i18n.language);

  const map: Record<string, string> = {
    today: t('date.today'),
    yesterday: t('date.yesterday'),
  };

  const line = isDark ? 'bg-[#3f4147]' : 'bg-gray-200';

  return (
    <div className="flex items-center gap-3 my-2">
      <div className={`flex-1 h-px ${line}`} />
      <span className={`text-[11px] font-medium px-2 ${theme.textFaint}`}>
        {map[raw] ?? raw}
      </span>
      <div className={`flex-1 h-px ${line}`} />
    </div>
  );
}
