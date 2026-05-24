import { useAuth } from '../../../context/AuthContext';
import { Avatar } from './Avatar';

type Props = {
  title: string;
  onlineCount: number;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenMyProfile: () => void;
  myProfile?: { username: string; avatar?: string | null };
};

export function TopBar({
  title,
  onlineCount,
  isDark,
  onToggleTheme,
  onOpenMyProfile,
  myProfile,
}: Props) {
  const { user } = useAuth();

  const border = isDark ? 'border-[#1e1f22]' : 'border-gray-200';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';

  return (
    <>
      <div
        className={`h-12 border-b flex items-center px-4 justify-between flex-shrink-0 transition-colors duration-200 ${
          isDark ? 'bg-[#313338]' : 'bg-white'
        } ${border}`}
      >
        <div className="flex items-center gap-2">
          <span className={`font-medium text-[15px] ${textPrimary}`}>
            {title}
          </span>
          <span className={`text-xs border-l pl-3 ml-1 ${textMuted} ${border}`}>
            {onlineCount} online
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border ${
              isDark
                ? 'border-gray-600 text-gray-400 hover:bg-gray-700'
                : 'border-gray-300 text-gray-500 hover:bg-gray-100'
            }`}
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>

          <button
            onClick={onOpenMyProfile}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-opacity hover:opacity-80 bg-purple-100 text-purple-800 cursor-pointer"
            title={user?.username}
          >
            <Avatar
              username={user?.username ?? ''}
              avatar={myProfile?.avatar}
              size="sm"
              isDark={isDark}
            />
          </button>
        </div>
      </div>
    </>
  );
}
