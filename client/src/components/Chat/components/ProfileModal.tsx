import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { fetchMe } from '../../../api/users.api';
import { EditProfileModal } from './EditProfileModal';
import type { UserProfile } from '../../../types/user';

type Props = {
  isDark: boolean;
  onClose: () => void;
};

export function ProfileModal({ isDark, onClose }: Props) {
  const { user, logout, accessToken } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    fetchMe(accessToken).then(setProfile);
  }, [accessToken]);

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

  const border = isDark ? 'border-[#1e1f22]' : 'border-gray-200';

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 flex items-start justify-end z-50 pt-14 pr-4"
        onClick={onClose}
      >
        <div
          className={`w-64 rounded-lg shadow-xl overflow-hidden ${isDark ? 'bg-[#2b2d31]' : 'bg-white'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Шапка */}
          <div className={`p-4 border-b ${border}`}>
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium flex-shrink-0 ${color.bg} ${color.text}`}
              >
                {user?.username.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p
                  className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  {user?.username}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span
                    className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    Online
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {profile?.bio && (
              <p
                className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                {profile.bio}
              </p>
            )}
          </div>

          {/* Дії */}
          <div className="p-2">
            <button
              onClick={() => setShowEdit(true)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${isDark ? 'text-gray-300 hover:bg-[#35373c]' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              ✏️ Редагувати профіль
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              → Вийти з акаунту
            </button>
          </div>
        </div>
      </div>

      {showEdit && (
        <EditProfileModal
          isDark={isDark}
          currentBio={profile?.bio ?? ''}
          onClose={() => setShowEdit(false)}
          onSaved={(bio) =>
            setProfile((prev) => (prev ? { ...prev, bio } : prev))
          }
        />
      )}
    </>
  );
}
