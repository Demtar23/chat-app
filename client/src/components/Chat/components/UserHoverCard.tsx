import { useTranslation } from 'react-i18next';
import { getTheme } from '../../../styles/theme';
import type { UserProfile } from '../../../types/user';
import { formatLastSeen } from '../../../utils/formatLastSeen';
import { Avatar } from './Avatar';

type Props = {
  user: UserProfile;
  isDark: boolean;
  isOnline: boolean;
  onStartChat: (userId: string, username: string) => void;
  onClose: () => void;
  currentUserId: string;
  onOpenProfile: (user: UserProfile) => void;
};

export function UserHoverCard({
  user,
  isDark,
  isOnline,
  onStartChat,
  onClose,
  currentUserId,
  onOpenProfile,
}: Props) {

  const { t } = useTranslation();
  const theme = getTheme(isDark);

  const isCurrentUser = currentUserId === user._id;

  return (
    <div
      className={`w-56 rounded-lg shadow-xl border p-3 ${theme.bgSecondary} ${theme.border}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="relative flex-shrink-0"
          onClick={() => {
            onOpenProfile(user);
            onClose();
          }}
        >
          <Avatar
            username={user.username}
            avatar={user.avatar}
            size="md"
            isDark={isDark}
          />
          <span
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 ${
              isDark ? 'border-[#2b2d31]' : 'border-white'
            } ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}
          />
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-medium truncate ${theme.textPrimary}`}>
            {user.username}
          </p>
          <p
            className={`text-[11px] ${isOnline ? 'text-green-400' : theme.textFaint}`}
          >
            {isOnline ? t('userHoverCard.online') : `${t('userHoverCard.lastSeen')} ${formatLastSeen(user.lastSeen)}`}
          </p>
        </div>
      </div>

      {user.bio && (
        <p className={`text-xs mb-2 leading-relaxed ${theme.textMuted}`}>
          {user.bio.length > 20 ? `${user.bio.slice(0, 20)}…` : user.bio}
        </p>
      )}

      {!isCurrentUser && (
        <button
          onClick={() => {
            onStartChat(user._id, user.username);
            onClose();
          }}
          className="w-full text-sm py-1.5 rounded-md bg-[#5865f2] hover:bg-[#4752c4] text-white transition-colors"
        >
          {t('userHoverCard.message')}
        </button>
      )}
    </div>
  );
}
