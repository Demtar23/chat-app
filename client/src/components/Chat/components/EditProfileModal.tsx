import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { updateMe } from '../../../api/users.api';
import { getSocket } from '../../../services/socket';
import { notify } from '../../../utils/toast';
import { Avatar } from './Avatar';

type Props = {
  isDark: boolean;
  currentBio: string;
  currentBannerColor?: string | null;
  username: string;
  onClose: () => void;
  currentAvatar?: string | null;
  onSaved: (
    bio: string,
    bannerColor: string | null,
    avatar: string | null,
  ) => void;
};

const BANNER_COLORS = [
  '#5865f2', // Discord синій
  '#57f287', // зелений
  '#fee75c', // жовтий
  '#eb459e', // рожевий
  '#ed4245', // червоний
  '#9b59b6', // фіолетовий
  '#3498db', // блакитний
  '#e67e22', // помаранчевий
  '#1abc9c', // бірюзовий
  '#e91e63', // малиновий
  '#2ecc71', // смарагдовий
  '#f39c12', // бурштиновий
  '#16a085', // темно-бірюзовий
  '#8e44ad', // темно-фіолетовий
  '#c0392b', // темно-червоний
  '#2980b9', // темно-синій
  '#27ae60', // темно-зелений
  '#d35400', // темно-помаранчевий
  '#7f8c8d', // сірий
  '#2c3e50', // темно-сланцевий
];

const AVATAR_EMOJIS = [
  '🐱',
  '🐶',
  '🐺',
  '🦊',
  '🐻',
  '🐼',
  '🐨',
  '🐯',
  '🦁',
  '🐮',
  '🐸',
  '🐙',
  '🦋',
  '🦅',
  '🐉',
  '🦄',
  '🧙',
  '🧛',
  '🧜',
  '🧚',
  '👾',
  '🤖',
  '👻',
  '💀',
  '🌙',
  '⭐',
  '🔥',
  '💎',
  '🌊',
  '🌸',
  '🍀',
  '🎭',
  '🎮',
  '🎸',
  '🚀',
  '⚡',
  '🌈',
  '💫',
  '🎯',
  '🏆',
];

export function EditProfileModal({
  isDark,
  currentBio,
  currentBannerColor,
  username,
  onClose,
  currentAvatar,
  onSaved,
}: Props) {
  const { accessToken } = useAuth();
  const [bio, setBio] = useState(currentBio);
  const [bannerColor, setBannerColor] = useState<string | null>(
    currentBannerColor ?? null,
  );
  const [avatar, setAvatar] = useState<string | null>(currentAvatar ?? null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;

    setIsLoading(true);

    try {
      const updated = await updateMe(accessToken, {
        bio: bio.trim(),
        bannerColor,
        avatar,
      });

      const socket = getSocket();
      socket?.emit('user:update', {
        bio: updated.bio,
        avatar: updated.avatar,
        bannerColor: updated.bannerColor,
      });

      onSaved(
        updated.bio ?? '',
        updated.bannerColor ?? null,
        updated.avatar ?? null,
      );
      onClose();
      notify.success('Профіль оновлено');
    } catch {
      notify.error('Не вдалося зберегти профіль');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-sm rounded-lg p-6 overflow-y-auto max-h-[90vh] ${isDark ? 'bg-[#2b2d31]' : 'bg-white'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className={`text-lg font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          Редагувати профіль
        </h2>
        <p
          className={`text-sm mb-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
        >
          Розкажи про себе
        </p>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Bio */}
          <div className="flex flex-col gap-1.5">
            <label
              className={`text-xs font-medium tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            >
              BIO
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="Розкажи про себе..."
              className={`text-sm px-3 py-2.5 rounded-md outline-none border border-transparent focus:border-[#5865f2] resize-none ${
                isDark
                  ? 'bg-[#1e1f22] text-white placeholder-gray-600'
                  : 'bg-gray-100 text-gray-900 placeholder-gray-400'
              }`}
            />
            <p
              className={`text-[10px] text-right ${isDark ? 'text-gray-600' : 'text-gray-400'}`}
            >
              {bio.length}/200
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label
              className={`text-xs font-medium tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            >
              АВАТАР
            </label>

            {/* Preview */}
            <div className="flex items-center gap-3">
              <Avatar
                username={username}
                avatar={avatar}
                size="md"
                isDark={isDark}
              />
              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar(null)}
                  className={`text-xs ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Скинути
                </button>
              )}
            </div>

            {/* Emoji grid */}
            <div className="flex flex-wrap gap-1.5">
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all hover:scale-110 ${
                    avatar === emoji
                      ? isDark
                        ? 'bg-[#5865f2]/30 ring-2 ring-[#5865f2]'
                        : 'bg-blue-100 ring-2 ring-blue-400'
                      : isDark
                        ? 'bg-[#1e1f22] hover:bg-[#383a40]'
                        : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Banner color */}
          <div className="flex flex-col gap-2">
            <label
              className={`text-xs font-medium tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            >
              КОЛІР БАНЕРА
            </label>

            {/* Preview */}
            <div
              className="h-10 rounded-md transition-colors duration-200"
              style={{ backgroundColor: bannerColor ?? '#5865f2' }}
            />

            {/* Palette */}
            <div className="flex flex-wrap gap-2">
              {BANNER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setBannerColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                    bannerColor === c
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110'
                      : ''
                  }`}
                  title={c}
                />
              ))}
            </div>

            {/* Скинути до дефолтного */}
            {bannerColor && (
              <button
                type="button"
                onClick={() => setBannerColor(null)}
                className={`text-xs self-start ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Скинути до дефолтного
              </button>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`text-sm px-4 py-2 rounded-md ${isDark ? 'text-gray-400 hover:bg-[#35373c]' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white text-sm px-4 py-2 rounded-md transition-colors"
            >
              {isLoading ? 'Збереження...' : 'Зберегти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
