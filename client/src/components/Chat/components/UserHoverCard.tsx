import type { UserProfile } from '../../../types/user';

type Props = {
  user: UserProfile;
  isDark: boolean;
  isOnline: boolean;
  onStartChat: (userId: string, username: string) => void;
  onClose: () => void;
};

function formatLastSeen(lastSeen?: string | null): string {
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

export function UserHoverCard({
  user,
  isDark,
  isOnline,
  onStartChat,
  onClose,
}: Props) {
  const color = getColor(user.username);

  return (
    <div
      className={`w-56 rounded-lg shadow-xl border p-3 ${
        isDark ? 'bg-[#2b2d31] border-[#1e1f22]' : 'bg-white border-gray-200'
      }`}
    >
      {/* Аватар + ім'я */}
      <div className="flex items-center gap-3 mb-2">
        <div className="relative flex-shrink-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${color.bg} ${color.text}`}
            >
              {user.username.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 ${
              isDark ? 'border-[#2b2d31]' : 'border-white'
            } ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}
          />
        </div>

        <div className="min-w-0">
          <p
            className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            {user.username}
          </p>
          <p
            className={`text-[11px] ${isOnline ? 'text-green-400' : isDark ? 'text-gray-500' : 'text-gray-400'}`}
          >
            {isOnline ? 'Online' : `Був ${formatLastSeen(user.lastSeen)}`}
          </p>
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <p
          className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
        >
          {user.bio}
        </p>
      )}

      {/* Кнопка написати */}
      <button
        onClick={() => {
          onStartChat(user._id, user.username);
          onClose();
        }}
        className="w-full text-sm py-1.5 rounded-md bg-[#5865f2] hover:bg-[#4752c4] text-white transition-colors"
      >
        Написати
      </button>
    </div>
  );
}
