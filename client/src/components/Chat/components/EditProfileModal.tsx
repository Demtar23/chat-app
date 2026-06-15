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
import { getTheme } from '../../../styles/theme';
import { useTranslation } from 'react-i18next';
import { Icons } from '../../icons/icons';

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
  '#5865f2',
  '#57f287',
  '#fee75c',
  '#eb459e',
  '#ed4245',
  '#9b59b6',
  '#3498db',
  '#e67e22',
  '#1abc9c',
  '#e91e63',
  '#2ecc71',
  '#f39c12',
  '#16a085',
  '#8e44ad',
  '#c0392b',
  '#2980b9',
  '#27ae60',
  '#d35400',
  '#7f8c8d',
  '#2c3e50',
];

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
const MAX_SIZE = 5 * 1024 * 1024;

type Tab = 'profile' | 'password';

function inputClass(isDark: boolean, error?: string) {
  const theme = getTheme(isDark);
  return `w-full text-sm px-3 py-2.5 rounded-md outline-none border transition-colors ${
    error
      ? 'border-red-500 focus:border-red-400'
      : 'border-transparent focus:border-[#5865f2]'
  } ${theme.bgInput} ${theme.textPrimary} placeholder:${theme.textFaintest}`;
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

  const { t } = useTranslation();

  const [bio, setBio] = useState(currentBio);
  const [bannerColor, setBannerColor] = useState<string | null>(
    currentBannerColor ?? null,
  );
  const [avatar, setAvatar] = useState<string | null>(currentAvatar ?? null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const oldPassword = useFormField(changePasswordSchema.shape.oldPassword);
  const newPassword = useFormField(changePasswordSchema.shape.newPassword);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const isUploadedAvatar = avatar?.includes('cloudinary.com') ?? false;

  const isPresetAvatar = avatar?.startsWith('http') && !isUploadedAvatar;

  const theme = getTheme(isDark);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      notify.error(t('editProfile.messages.invalidFormat'));
      return;
    }

    if (file.size > MAX_SIZE) {
      notify.error(t('editProfile.messages.fileTooLarge'));
      return;
    }

    setPhotoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
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

      if (fileInputRef.current) fileInputRef.current.value = '';

      notify.success(t('editProfile.messages.photoUploaded'));
    } catch (err) {
      notify.error(
        err instanceof Error
          ? err.message
          : t('editProfile.messages.uploadError'),
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
      notify.success(t('editProfile.messages.photoDeleted'));
    } catch (err) {
      notify.error(
        err instanceof Error
          ? err.message
          : t('editProfile.messages.deleteError'),
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
      notify.success(t('editProfile.messages.profileUpdated'));
    } catch {
      notify.error(t('editProfile.messages.saveError'));
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
      newPassword.setError(t('editProfile.messages.passwordMismatch'));
      return;
    }

    setIsPasswordLoading(true);
    try {
      await apiChangePassword(
        oldPassword.value,
        newPassword.value,
        accessToken,
      );
      notify.success(t('editProfile.messages.passwordChanged'));
      oldPassword.reset();
      newPassword.reset();
    } catch (err) {
      notify.error(
        err instanceof Error
          ? err.message
          : t('editProfile.messages.passwordError'),
      );
    } finally {
      setIsPasswordLoading(false);
    }
  }

  const isPhotoAvatar = avatar && avatar.startsWith('http');

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-sm rounded-lg overflow-y-auto max-h-[90vh] ${theme.bgSecondary}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex border-b ${theme.border}`}>
          {(['profile', 'password'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? `${theme.textPrimary} border-b-2 ${theme.brandBorder}`
                  : `${theme.textFaint} ${theme.bgHover}`
              }`}
            >
              {tab === 'profile'
                ? t('editProfile.tabs.profile')
                : t('editProfile.tabs.password')}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  className={`text-xs font-medium tracking-wide ${theme.textMuted}`}
                >
                  {t('editProfile.bio')}
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={200}
                  rows={3}
                  placeholder={t('editProfile.bioPlaceholder')}
                  className={`text-sm px-3 py-2.5 rounded-md outline-none border border-transparent focus:border-[#5865f2] resize-none ${theme.bgInput} ${theme.textPrimary}`}
                />
                <p className={`text-[10px] text-right ${theme.textFaintest}`}>
                  {bio.length}/200
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  className={`text-xs font-medium tracking-wide ${theme.textMuted}`}
                >
                  {t('editProfile.avatar')}
                </label>

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
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-md border transition-colors ${theme.border} ${theme.textSecondary} ${theme.bgHover}`}
                    >
                      <Icons.camera className="w-4 h-4" />
                      {t('editProfile.uploadPhoto')}
                    </button>

                    {photoPreview && (
                      <>
                        <button
                          type="button"
                          onClick={handleUploadPhoto}
                          disabled={isUploadingPhoto}
                          className="text-xs px-2.5 py-1.5 rounded-md bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white transition-colors"
                        >
                          {isUploadingPhoto
                            ? t('editProfile.actions.saving')
                            : t('editProfile.savePhoto')}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelPhoto}
                          className={`text-xs px-2.5 py-1.5 rounded-md ${theme.textFaint} ${theme.bgHover}`}
                        >
                          {t('editProfile.actions.cancel')}
                        </button>
                      </>
                    )}

                    {isUploadedAvatar && !photoPreview && (
                      <button
                        type="button"
                        onClick={handleDeletePhoto}
                        className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-md text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Icons.delete className="w-4 h-4" />
                        {t('editProfile.deletePhoto')}
                      </button>
                    )}

                    {(isPresetAvatar ||
                      (avatar && !avatar.startsWith('http'))) &&
                      !photoPreview && (
                        <button
                          type="button"
                          onClick={() => setAvatar(null)}
                          className={`text-xs ${theme.textFaint} ${theme.bgHover}`}
                        >
                          {t('editProfile.reset')}
                        </button>
                      )}

                    {avatar && !isPhotoAvatar && !photoPreview && (
                      <button
                        type="button"
                        onClick={() => setAvatar(null)}
                        className={`text-xs self-start ${theme.textFaint} ${theme.bgHover}`}
                      >
                        {t('editProfile.reset')}
                      </button>
                    )}
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <p className={`text-[10px] ${theme.textFaintest}`}>
                  {t('editProfile.avatarHint')}
                </p>

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

              <div className="flex flex-col gap-2">
                <label
                  className={`text-xs font-medium tracking-wide ${theme.textMuted}`}
                >
                  {t('editProfile.bannerColor')}
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
                    className={`text-xs self-start ${theme.textFaint} ${theme.bgHover}`}
                  >
                    {t('editProfile.reset')}
                  </button>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className={`text-sm px-4 py-2 rounded-md ${theme.textMuted} ${theme.bgHover}`}
                >
                  {t('editProfile.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isProfileLoading}
                  className="bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white text-sm px-4 py-2 rounded-md transition-colors"
                >
                  {isProfileLoading
                    ? t('editProfile.actions.savings')
                    : t('editProfile.actions.save')}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form
              onSubmit={handleChangePassword}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label
                  className={`text-xs font-medium tracking-wide ${theme.textMuted}`}
                >
                  {t('editProfile.password.current')}
                </label>
                <input
                  type="password"
                  value={oldPassword.value}
                  onChange={oldPassword.onChange}
                  onBlur={oldPassword.onBlur}
                  className={inputClass(isDark, oldPassword.error)}
                  placeholder={t('editProfile.password.currentPlaceholder')}
                  autoComplete="current-password"
                />
                {oldPassword.error && (
                  <p className="text-red-400 text-xs">{oldPassword.error}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className={`text-xs font-medium tracking-wide ${theme.textMuted}`}
                >
                  {t('editProfile.password.new')}
                </label>
                <input
                  type="password"
                  value={newPassword.value}
                  onChange={newPassword.onChange}
                  onBlur={newPassword.onBlur}
                  className={inputClass(isDark, newPassword.error)}
                  placeholder={t('editProfile.password.newPlaceholder')}
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
                  className={`text-sm px-4 py-2 rounded-md ${theme.textMuted} ${theme.bgHover}`}
                >
                  {t('editProfile.actions.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isPasswordLoading}
                  className="bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white text-sm px-4 py-2 rounded-md transition-colors"
                >
                  {isPasswordLoading
                    ? t('editProfile.actions.saving')
                    : t('editProfile.password.save')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
