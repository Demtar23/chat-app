import { useRef, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  deleteAvatarApi,
  updateMe,
  uploadAvatar,
} from '../../../api/users.api';
import { getSocket } from '../../../services/socket';
import { notify } from '../../../utils/toast';
import { Avatar } from './Avatar';
import { changePasswordSchema } from '../../../validations/auth.schema';
import { apiChangePassword } from '../../../api/auth.api';
import { useFormField } from '../../../hooks/useFormField';

const IMAGE_KIT_URL = import.meta.env.VITE_IMAGE_KIT_URL;

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

// const AVATAR_EMOJIS = [
//   '🐱',
//   '🐶',
//   '🐺',
//   '🦊',
//   '🐻',
//   '🐼',
//   '🐨',
//   '🐯',
//   '🦁',
//   '🐮',
//   '🐸',
//   '🐙',
//   '🦋',
//   '🦅',
//   '🐉',
//   '🦄',
//   '🧙',
//   '🧛',
//   '🧜',
//   '🧚',
//   '👾',
//   '🤖',
//   '👻',
//   '💀',
//   '🌙',
//   '⭐',
//   '🔥',
//   '💎',
//   '🌊',
//   '🌸',
//   '🍀',
//   '🎭',
//   '🎮',
//   '🎸',
//   '🚀',
//   '⚡',
//   '🌈',
//   '💫',
//   '🎯',
//   '🏆',
// ];

const AVATAR_PRESETS = [
  `${IMAGE_KIT_URL}/avatar_1.png`,
  `${IMAGE_KIT_URL}/avatar_2.png`,
  `${IMAGE_KIT_URL}/avatar_3.png`,
  `${IMAGE_KIT_URL}/avatar_4.png`,
  `${IMAGE_KIT_URL}/avatar_5.png`,
  `${IMAGE_KIT_URL}/avatar_6.png`,
  `${IMAGE_KIT_URL}/avatar_7.png`,
  `${IMAGE_KIT_URL}/avatar_8.png`,
  `${IMAGE_KIT_URL}/avatar_9.png`,
  `${IMAGE_KIT_URL}/avatar_10.png`,
  `${IMAGE_KIT_URL}/avatar_11.png`,
  `${IMAGE_KIT_URL}/avatar_12.png`,
  `${IMAGE_KIT_URL}/avatar_13.png`,
  `${IMAGE_KIT_URL}/avatar_14.png`,
  `${IMAGE_KIT_URL}/avatar_15.png`,
  `${IMAGE_KIT_URL}/avatar_16.png`,
  `${IMAGE_KIT_URL}/avatar_17.png`,
  `${IMAGE_KIT_URL}/avatar_18.png`,
  `${IMAGE_KIT_URL}/avatar_19.png`,
  `${IMAGE_KIT_URL}/avatar_20.png`,
  `${IMAGE_KIT_URL}/avatar_21.png`,
  `${IMAGE_KIT_URL}/avatar_22.png`,
  `${IMAGE_KIT_URL}/avatar_23.png`,
  `${IMAGE_KIT_URL}/avatar_24.png`,
  `${IMAGE_KIT_URL}/avatar_25.png`,
  `${IMAGE_KIT_URL}/avatar_26.png`,
  `${IMAGE_KIT_URL}/avatar_27.png`,
  `${IMAGE_KIT_URL}/avatar_28.png`,
  `${IMAGE_KIT_URL}/avatar_29.png`,
  `${IMAGE_KIT_URL}/avatar_30.png`,
  `${IMAGE_KIT_URL}/avatar_31.png`,
  `${IMAGE_KIT_URL}/avatar_32.png`,
  `${IMAGE_KIT_URL}/avatar_33.png`,
  `${IMAGE_KIT_URL}/avatar_34.png`,
  `${IMAGE_KIT_URL}/avatar_35.png`,
];

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

type Tab = 'profile' | 'password';

function inputClass(isDark: boolean, error?: string) {
  return `w-full text-sm px-3 py-2.5 rounded-md outline-none border transition-colors ${
    error
      ? 'border-red-500 focus:border-red-400'
      : 'border-transparent focus:border-[#5865f2]'
  } ${isDark ? 'bg-[#1e1f22] text-white placeholder-gray-600' : 'bg-gray-100 text-gray-900 placeholder-gray-400'}`;
}

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
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const [bio, setBio] = useState(currentBio);
  const [bannerColor, setBannerColor] = useState<string | null>(
    currentBannerColor ?? null,
  );
  const [avatar, setAvatar] = useState<string | null>(currentAvatar ?? null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // стан для завантаження фото
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const oldPassword = useFormField(changePasswordSchema.shape.oldPassword);
  const newPassword = useFormField(changePasswordSchema.shape.newPassword);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // аватар завантажений через Cloudinary (наш upload)
  const isUploadedAvatar = avatar?.includes('cloudinary.com') ?? false;

  // аватар з Google або ImageKit preset
  const isPresetAvatar = avatar?.startsWith('http') && !isUploadedAvatar;

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      notify.error('Дозволені формати: jpg, png, webp, gif');
      return;
    }

    if (file.size > MAX_SIZE) {
      notify.error('Максимальний розмір файлу — 5MB');
      return;
    }

    setPhotoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
    // скидаємо emoji якщо вибрали фото
    setAvatar(null);
  }

  async function handleUploadPhoto() {
    if (!photoFile || !accessToken) return;

    setIsUploadingPhoto(true);
    try {
      const { avatar: avatarUrl } = await uploadAvatar(photoFile, accessToken);
      setAvatar(avatarUrl);
      setPhotoPreview(null);
      setPhotoFile(null);

      // очищаємо input
      if (fileInputRef.current) fileInputRef.current.value = '';

      notify.success('Фото завантажено');
    } catch (err) {
      notify.error(
        err instanceof Error ? err.message : 'Не вдалося завантажити фото',
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  function handleCancelPhoto() {
    setPhotoPreview(null);
    setPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleDeletePhoto() {
    if (!accessToken) return;
    try {
      await deleteAvatarApi(accessToken);
      setAvatar(null);
      notify.success('Фото видалено');
    } catch (err) {
      notify.error(
        err instanceof Error ? err.message : 'Не вдалося видалити фото',
      );
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;

    setIsProfileLoading(true);
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
      setIsProfileLoading(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;

    const isOldValid = oldPassword.validateNow();
    const isNewValid = newPassword.validateNow();
    if (!isOldValid || !isNewValid) return;

    if (oldPassword.value === newPassword.value) {
      newPassword.setError('New password must be different from old password');
      return;
    }

    setIsPasswordLoading(true);
    try {
      await apiChangePassword(
        oldPassword.value,
        newPassword.value,
        accessToken,
      );
      notify.success('Пароль змінено');
      oldPassword.reset();
      newPassword.reset();
    } catch (err) {
      notify.error(
        err instanceof Error ? err.message : 'Не вдалося змінити пароль',
      );
    } finally {
      setIsPasswordLoading(false);
    }
  }

  // визначаємо поточний аватар для preview
  const isPhotoAvatar = avatar && avatar.startsWith('http');

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-sm rounded-lg overflow-y-auto max-h-[90vh] ${isDark ? 'bg-[#2b2d31]' : 'bg-white'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* tabs */}
        <div
          className={`flex border-b ${isDark ? 'border-[#1e1f22]' : 'border-gray-200'}`}
        >
          {(['profile', 'password'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? isDark
                    ? 'text-white border-b-2 border-[#5865f2]'
                    : 'text-gray-900 border-b-2 border-blue-500'
                  : isDark
                    ? 'text-gray-500 hover:text-gray-300'
                    : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab === 'profile' ? 'Профіль' : 'Пароль'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
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

              {/* Avatar */}
              <div className="flex flex-col gap-2">
                <label
                  className={`text-xs font-medium tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  АВАТАР
                </label>

                {/* Preview */}
                <div className="flex items-center gap-3">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="preview"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <Avatar
                      username={username}
                      avatar={avatar}
                      size="md"
                      isDark={isDark}
                    />
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {/* кнопка вибору файлу */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
                        isDark
                          ? 'border-gray-600 text-gray-300 hover:bg-[#35373c]'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      📷 Завантажити фото
                    </button>

                    {/* кнопка upload якщо є preview */}
                    {photoPreview && (
                      <>
                        <button
                          type="button"
                          onClick={handleUploadPhoto}
                          disabled={isUploadingPhoto}
                          className="text-xs px-2.5 py-1.5 rounded-md bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white transition-colors"
                        >
                          {isUploadingPhoto
                            ? 'Завантаження...'
                            : 'Зберегти фото'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelPhoto}
                          className={`text-xs px-2.5 py-1.5 rounded-md ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          Скасувати
                        </button>
                      </>
                    )}

                    {/* видалити фото якщо є URL */}
                    {/* видалити фото — тільки для завантажених через Cloudinary */}
                    {isUploadedAvatar && !photoPreview && (
                      <button
                        type="button"
                        onClick={handleDeletePhoto}
                        className="text-xs px-2.5 py-1.5 rounded-md text-red-400 hover:text-red-300 transition-colors"
                      >
                        Видалити фото
                      </button>
                    )}

                    {/* скинути preset або відсутній аватар */}
                    {(isPresetAvatar ||
                      (avatar && !avatar.startsWith('http'))) &&
                      !photoPreview && (
                        <button
                          type="button"
                          onClick={() => setAvatar(null)}
                          className={`text-xs ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          Скинути
                        </button>
                      )}

                    {/* скинути emoji */}
                    {avatar && !isPhotoAvatar && !photoPreview && (
                      <button
                        type="button"
                        onClick={() => setAvatar(null)}
                        className={`text-xs ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        Скинути
                      </button>
                    )}
                  </div>
                </div>

                {/* прихований input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <p
                  className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}
                >
                  JPG, PNG, WebP, GIF — до 5MB
                </p>

                {/* Emoji grid */}
                {!photoPreview && (
                  <div className="flex flex-wrap gap-1.5">
                    {AVATAR_PRESETS.map((url) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => setAvatar(url)}
                        className={`w-10 h-10 rounded-full overflow-hidden transition-all hover:scale-110 ${
                          avatar === url ? 'ring-2 ring-[#5865f2]' : ''
                        }`}
                      >
                        <img
                          src={url}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Banner color */}
              <div className="flex flex-col gap-2">
                <label
                  className={`text-xs font-medium tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  КОЛІР БАНЕРА
                </label>
                <div
                  className="h-10 rounded-md transition-colors duration-200"
                  style={{ backgroundColor: bannerColor ?? '#5865f2' }}
                />
                <div className="flex flex-wrap gap-2">
                  {BANNER_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setBannerColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                        bannerColor === c
                          ? 'ring-2 ring-white ring-offset-2 scale-110'
                          : ''
                      }`}
                    />
                  ))}
                </div>
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
                  disabled={isProfileLoading}
                  className="bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white text-sm px-4 py-2 rounded-md transition-colors"
                >
                  {isProfileLoading ? 'Збереження...' : 'Зберегти'}
                </button>
              </div>
            </form>
          )}

          {/* password tab */}
          {activeTab === 'password' && (
            <form
              onSubmit={handleChangePassword}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label
                  className={`text-xs font-medium tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  ПОТОЧНИЙ ПАРОЛЬ
                </label>
                <input
                  type="password"
                  value={oldPassword.value}
                  onChange={oldPassword.onChange}
                  onBlur={oldPassword.onBlur}
                  className={inputClass(isDark, oldPassword.error)}
                  placeholder="Введи поточний пароль"
                  autoComplete="current-password"
                />
                {oldPassword.error && (
                  <p className="text-red-400 text-xs">{oldPassword.error}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className={`text-xs font-medium tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  НОВИЙ ПАРОЛЬ
                </label>
                <input
                  type="password"
                  value={newPassword.value}
                  onChange={newPassword.onChange}
                  onBlur={newPassword.onBlur}
                  className={inputClass(isDark, newPassword.error)}
                  placeholder="Мін. 8 символів, велика/мала літера, цифра, спецсимвол"
                  autoComplete="new-password"
                />
                {newPassword.error && (
                  <p className="text-red-400 text-xs">{newPassword.error}</p>
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
                  disabled={isPasswordLoading}
                  className="bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white text-sm px-4 py-2 rounded-md transition-colors"
                >
                  {isPasswordLoading ? 'Збереження...' : 'Змінити пароль'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
