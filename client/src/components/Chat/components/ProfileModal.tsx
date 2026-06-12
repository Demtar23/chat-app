import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { EditProfileModal } from './EditProfileModal';
import type { UserProfile } from '../../../types/user';
import { formatLastSeen } from '../../../utils/formatLastSeen';
import { Avatar } from './Avatar';
import { getTheme } from '../../../styles/theme';
import { useTranslation } from 'react-i18next';
import { Icons } from '../../icons/icons';

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
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const [showEdit, setShowEdit] = useState(false);
  const theme = getTheme(isDark);

  const COLORS = [
    { banner: 'bg-purple-200' },
    { banner: 'bg-teal-200' },
    { banner: 'bg-orange-200' },
    { banner: 'bg-blue-200' },
    { banner: 'bg-pink-200' },
  ];
  const color = COLORS[profile.username.charCodeAt(0) % COLORS.length];

  async function handleLogout() {
    await logout();
    onClose();
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className={`w-80 rounded-xl shadow-2xl overflow-hidden ${theme.bgSecondary}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="h-20 relative"
            style={{ backgroundColor: profile.bannerColor ?? undefined }}
          >
            {!profile.bannerColor && (
              <div className={`h-full ${color.banner}`} />
            )}
          </div>

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
            </div>

            <p className={`font-bold text-base ${theme.textPrimary}`}>
              {profile.username}
            </p>
            <p
              className={`text-xs mt-0.5 ${isOnline ? 'text-green-400' : theme.textFaint}`}
            >
              {isOnline ? t('profile.online') : t('profile.offline')}
            </p>
          </div>

          <div
            className={`mx-4 mb-3 rounded-lg p-3 flex flex-col gap-3 ${theme.bgPrimary}`}
          >
            {profile.bio && (
              <div>
                <p
                  className={`text-[10px] tracking-widest font-semibold mb-1 ${theme.textMuted}`}
                >
                  {t('profile.about')}
                </p>
                <p
                  className={`text-xs leading-relaxed break-words whitespace-pre-wrap ${theme.textSecondary}`}
                >
                  {profile.bio}
                </p>
              </div>
            )}

            {!isOwnProfile && !isOnline && profile.lastSeen && (
              <div>
                <p
                  className={`text-[10px] tracking-widest font-semibold mb-1 ${theme.textMuted}`}
                >
                  {t('profile.lastSeen')}
                </p>
                <p className={`text-xs ${theme.textSecondary}`}>
                  {formatLastSeen(profile.lastSeen)}
                </p>
              </div>
            )}

            {profile.createdAt && (
              <div>
                <p
                  className={`text-[10px] tracking-widest font-semibold mb-1 ${theme.textMuted}`}
                >
                  {t('profile.memberSince')}
                </p>
                <p className={`text-xs ${theme.textSecondary}`}>
                  {new Date(profile.createdAt).toLocaleDateString(
                    i18n.language === 'uk' ? 'uk-UA' : 'en-US',
                    {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    },
                  )}
                </p>
              </div>
            )}
          </div>

          <div className="px-4 pb-3 flex flex-col gap-1">
            {isOwnProfile ? (
              <>
                <button
                  onClick={() => setShowEdit(true)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${theme.textSecondary} ${theme.bgHover}`}
                >
                  <Icons.edit className="w-4 h-4" /> {t('profile.edit')}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  → {t('profile.logout')}
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
                {t('profile.message')}
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
