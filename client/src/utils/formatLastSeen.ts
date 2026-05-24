export function formatLastSeen(lastSeen?: string | null): string {
  if (!lastSeen) {
    return 'Давно';
  }
  const diff = Date.now() - new Date(lastSeen).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) {
    return 'щойно';
  }

  if (minutes < 60) {
    return `${minutes} хв тому`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} год тому`;
  }

  return `${Math.floor(hours / 24)} дн тому`;
}