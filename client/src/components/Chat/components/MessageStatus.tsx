import { getTheme } from '../../../styles/theme';

type Props = {
  status: 'sent' | 'delivered' | 'seen';
  isDark: boolean;
};

export function MessageStatus({ status, isDark }: Props) {
  const t = getTheme(isDark);

  if (status === 'sent') {
    return <span className={`text-[10px] ${t.textFaintest}`}>✓</span>;
  }

  if (status === 'delivered') {
    return <span className={`text-[10px] ${t.textFaint}`}>✓✓</span>;
  }

  return <span className="text-[10px] text-blue-400">✓✓</span>;
}
