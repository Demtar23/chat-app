import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { EditProfileModal } from './EditProfileModal';
import type { UserProfile } from '../../../types/user';
import { formatLastSeen } from '../../../utils/formatLastSeen';
import { Avatar } from './Avatar';

type Props = {
  isDark: boolean;
  onClose: () => void;
  profile: UserProfile;
  isOwnProfile: boolean;
  isOnline?: boolean;
  onStartChat?: (userId: string, username: string) => void;
  onProfileUpdate?: (updated: UserProfile) => void;
};

export function ProfileModal({
  isDark,
  onClose,
  profile,
  isOwnProfile,
  isOnline,
  onStartChat,
  onProfileUpdate,
}: Props) {
  const { logout } = useAuth();
  const [showEdit, setShowEdit] = useState(false);

  async function handleLogout() {
    await logout();
    onClose();
  }

  const COLORS = [
    { bg: 'bg-purple-100', text: 'text-purple-800', banner: 'bg-purple-200' },
    { bg: 'bg-teal-100', text: 'text-teal-800', banner: 'bg-teal-200' },
    { bg: 'bg-orange-100', text: 'text-orange-800', banner: 'bg-orange-200' },
    { bg: 'bg-blue-100', text: 'text-blue-800', banner: 'bg-blue-200' },
    { bg: 'bg-pink-100', text: 'text-pink-800', banner: 'bg-pink-200' },
  ];

  const color = COLORS[profile.username.charCodeAt(0) % COLORS.length];
  // const border = isDark ? 'border-[#1e1f22]' : 'border-gray-200';

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className={`w-80 rounded-xl shadow-2xl overflow-hidden ${
            isDark ? 'bg-[#2b2d31]' : 'bg-white'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Banner */}
          <div
            className="h-20 relative"
            style={{ backgroundColor: profile.bannerColor ?? color.banner }}
          />

          {/* Avatar — виступає над банером */}
          <div className="px-4 pb-3">
            <div className="flex items-end justify-between -mt-8 mb-3">
              <div className="relative">
                <Avatar
                  username={profile.username}
                  avatar={profile.avatar}
                  size="lg"
                  isDark={isDark}
                  className={`border-4 ${isDark ? 'border-[#2b2d31]' : 'border-white'}`}
                />
                <span
                  className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 ${
                    isDark ? 'border-[#2b2d31]' : 'border-white'
                  } ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                />
              </div>

              {/* Кнопки дій справа */}
            </div>

            {/* Username + статус */}
            <p
              className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              {profile.username}
            </p>
            <p
              className={`text-xs mt-0.5 ${isOnline ? 'text-green-400' : isDark ? 'text-gray-500' : 'text-gray-400'}`}
            >
              {isOnline ? '● Online' : '● Offline'}
            </p>
          </div>

          {/* Інформація */}
          <div
            className={`mx-4 mb-3 rounded-lg p-3 flex flex-col gap-3 ${isDark ? 'bg-[#1e1f22]' : 'bg-gray-50'}`}
          >
            {/* Bio */}
            {profile.bio && (
              <div>
                <p
                  className={`text-[10px] tracking-widest font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  ПРО СЕБЕ
                </p>
                <p
                  className={`text-xs leading-relaxed break-words whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {profile.bio}
                </p>
              </div>
            )}

            {/* lastSeen */}
            {!isOwnProfile && !isOnline && profile.lastSeen && (
              <div>
                <p
                  className={`text-[10px] tracking-widest font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  ОСТАННІЙ РАЗ ОНЛАЙН
                </p>
                <p
                  className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {formatLastSeen(profile.lastSeen)}
                </p>
              </div>
            )}

            {/* createdAt */}
            {profile.createdAt && (
              <div>
                <p
                  className={`text-[10px] tracking-widests font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  УЧАСНИК З
                </p>
                <p
                  className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {new Date(profile.createdAt).toLocaleDateString('uk-UA', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Actions для свого профілю */}
          <div className={`px-4 pb-3 flex flex-col gap-1`}>
            {isOwnProfile ? (
              <>
                <button
                  onClick={() => setShowEdit(true)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    isDark
                      ? 'text-gray-300 hover:bg-[#35373c]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  ✏️ Редагувати профіль
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  → Вийти з акаунту
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onStartChat?.(profile._id, profile.username);
                  onClose();
                }}
                className="w-full py-2 rounded-md bg-[#5865f2] hover:bg-[#4752c4] text-white text-sm font-medium transition-colors"
              >
                Написати
              </button>
            )}
          </div>
        </div>
      </div>

      {showEdit && (
        <EditProfileModal
          isDark={isDark}
          currentBio={profile.bio ?? ''}
          currentBannerColor={profile.bannerColor}
          currentAvatar={profile.avatar}
          username={profile.username}
          onClose={() => setShowEdit(false)}
          onSaved={(bio, bannerColor, avatar) => {
            onProfileUpdate?.({ ...profile, bio, bannerColor, avatar });
          }}
        />
      )}
    </>
  );
}
