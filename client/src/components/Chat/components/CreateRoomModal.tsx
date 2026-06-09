import { useState } from 'react';
import { getSocket } from '../../../services/socket';
import type { Room } from '../../../types/room';
import { createRoom } from '../../../api/rooms.api';
import { notify } from '../../../utils/toast';
import { getTheme } from '../../../styles/theme';
import { useTranslation } from 'react-i18next';

type Props = {
  isDark: boolean;
  accessToken: string;
  onClose: () => void;
  onCreated: (room: Room) => void;
};

export function CreateRoomModal({
  isDark,
  accessToken,
  onClose,
  onCreated,
}: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const theme = getTheme(isDark);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const room = await createRoom(accessToken, name, description);
      const socket = getSocket();
      socket?.emit('room:created', room);
      onCreated(room);
      notify.success(t('roomModal.success'));
    } catch (err) {
      notify.error(
        err instanceof Error ? err.message : t('roomModal.error'),
      );
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
        className={`w-full max-w-sm rounded-lg p-6 ${theme.bgSecondary}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={`text-lg font-medium mb-1 ${theme.textPrimary}`}>
          {t('roomModal.title')}
        </h2>
        <p className={`text-sm mb-5 ${theme.textMuted}`}>
          {t('roomModal.subtitle')}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              className={`text-xs font-medium tracking-wide ${theme.textMuted}`}
            >
              {t('roomModal.nameLabel')}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('roomModal.namePlaceholder')}
              className={`text-sm px-3 py-2.5 rounded-md outline-none border border-transparent focus:border-[#5865f2] ${theme.bgInput} ${theme.textPrimary}`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className={`text-xs font-medium tracking-wide ${theme.textMuted}`}
            >
              {t('roomModal.descLabel')}
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('roomModal.descPlaceholder')}
              className={`text-sm px-3 py-2.5 rounded-md outline-none border border-transparent focus:border-[#5865f2] ${theme.bgInput} ${theme.textPrimary}`}
            />
          </div>

          <div className="flex gap-2 justify-end mt-1">
            <button
              type="button"
              onClick={onClose}
              className={`text-sm px-4 py-2 rounded-md ${theme.textMuted} ${theme.bgHover}`}
            >
              {t('roomModal.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white text-sm px-4 py-2 rounded-md transition-colors"
            >
              {isLoading ? t('roomModal.creating') : t('roomModal.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
