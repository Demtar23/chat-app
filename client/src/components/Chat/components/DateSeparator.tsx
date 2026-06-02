function formatDateSeparator(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor(
    (now.setHours(0, 0, 0, 0) - d.setHours(0, 0, 0, 0)) / 86400000,
  );

  if (diff === 0) return 'Сьогодні';
  if (diff === 1) return 'Вчора';
  if (diff < 7) {
    return d.toLocaleDateString('uk-UA', { weekday: 'long' });
  }
  return d.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: diff > 365 ? 'numeric' : undefined,
  });
}

export function DateSeparator({ date, isDark }: { date: string; isDark: boolean }) {
  return (
    <div className="flex items-center gap-3 my-2">
      <div
        className={`flex-1 h-px ${isDark ? 'bg-[#3f4147]' : 'bg-gray-200'}`}
      />
      <span
        className={`text-[11px] font-medium px-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
      >
        {formatDateSeparator(date)}
      </span>
      <div
        className={`flex-1 h-px ${isDark ? 'bg-[#3f4147]' : 'bg-gray-200'}`}
      />
    </div>
  );
}
