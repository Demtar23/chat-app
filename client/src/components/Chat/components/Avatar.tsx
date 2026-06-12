import { getTheme } from '../../../styles/theme';

const COLORS = [
  { bg: 'bg-purple-100', text: 'text-purple-800' },
  { bg: 'bg-teal-100', text: 'text-teal-800' },
  { bg: 'bg-orange-100', text: 'text-orange-800' },
  { bg: 'bg-blue-100', text: 'text-blue-800' },
  { bg: 'bg-pink-100', text: 'text-pink-800' },
];

function getColor(username: string) {
  return COLORS[username.charCodeAt(0) % COLORS.length];
}

function isEmoji(str: string) {
  return str.length <= 4 && !str.startsWith('http');
}

type Props = {
  username: string;
  avatar?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isDark?: boolean;
  className?: string;
};

const SIZE = {
  xs: { outer: 'w-6 h-6', text: 'text-[9px]', emoji: 'text-sm' },
  sm: { outer: 'w-8 h-8', text: 'text-xs', emoji: 'text-lg' },
  md: { outer: 'w-10 h-10', text: 'text-sm', emoji: 'text-xl' },
  lg: { outer: 'w-16 h-16', text: 'text-xl', emoji: 'text-3xl' },
};

export function Avatar({
  username,
  avatar,
  size = 'sm',
  isDark = true,
  className = '',
}: Props) {
  const color = getColor(username);
  const s = SIZE[size];
  const t = getTheme(isDark);

  if (avatar && isEmoji(avatar)) {
    return (
      <div
        className={`${s.outer} rounded-full flex items-center justify-center flex-shrink-0 ${t.bgMessage} ${className}`}
      >
        <span className={s.emoji}>{avatar}</span>
      </div>
    );
  }

  if (avatar && avatar.startsWith('http')) {
    return (
      <img
        src={avatar}
        alt={username}
        className={`${s.outer} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${s.outer} rounded-full flex items-center justify-center flex-shrink-0 font-medium ${color.bg} ${color.text} ${className}`}
    >
      <span className={s.text}>{username.slice(0, 1).toUpperCase()}</span>
    </div>
  );
}
