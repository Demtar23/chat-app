import i18n from "../i18n";

export function formatLastSeen(lastSeen?: string | null): string {
  const t  = i18n.t;
  if (!lastSeen) {
    return t('lastSeen.longTimeAgo');
  }
  const diff = Date.now() - new Date(lastSeen).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) {
    return t('lastSeen.justNow');
  }

  if (minutes < 60) {
    return `${minutes} ${t('lastSeen.minutesAgo')}`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} ${t('lastSeen.hoursAgo')}`;
  }

  return `${Math.floor(hours / 24)} ${t('lastSeen.daysAgo')}`;
}