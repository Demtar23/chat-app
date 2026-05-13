import { useAuth } from '../../../context/AuthContext';

type Props = {
  isDark: boolean;
  onClose: () => void;
};

export function ProfileModal({ isDark, onClose }: Props) {
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    onClose();
  }

  const COLORS = [
    { bg: 'bg-purple-100', text: 'text-purple-800' },
    { bg: 'bg-teal-100', text: 'text-teal-800' },
    { bg: 'bg-orange-100', text: 'text-orange-800' },
    { bg: 'bg-blue-100', text: 'text-blue-800' },
    { bg: 'bg-pink-100', text: 'text-pink-800' },
  ];

  const color = user
    ? COLORS[user.username.charCodeAt(0) % COLORS.length]
    : COLORS[0];

  return (
    // overlay
    <div
      className="fixed inset-0 bg-black/60 flex items-start justify-end z-50 pt-14 pr-4"
      onClick={onClose}
    >
      <div
        className={`w-64 rounded-lg shadow-xl overflow-hidden ${
          isDark ? 'bg-[#2b2d31]' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка профілю */}
        <div
          className={`p-4 border-b ${
            isDark ? 'border-[#1e1f22]' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Аватар */}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium flex-shrink-0 ${color.bg} ${color.text}`}
            >
              {user?.username.slice(0, 2).toUpperCase()}
            </div>

            <div>
              <p
                className={`font-medium text-sm ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                {user?.username}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span
                  className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Інфо */}
        <div
          className={`px-4 py-3 border-b ${
            isDark ? 'border-[#1e1f22]' : 'border-gray-200'
          }`}
        >
          <p
            className={`text-[10px] tracking-widest font-medium mb-1 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            USER ID
          </p>
          <p
            className={`text-xs font-mono truncate ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {user?.id}
          </p>
        </div>

        {/* Дії */}
        <div className="p-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <span>→</span>
            Вийти з акаунту
          </button>
        </div>
      </div>
    </div>
  );
}