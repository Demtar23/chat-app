import { useState } from 'react';
import { getSocket } from '../../../services/socket';
import type { Room } from '../../../types/room';
import { createRoom } from '../../../api/rooms.api';
import { notify } from '../../../utils/toast';

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
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const room = await createRoom(accessToken, name, description);
      const socket = getSocket();
      socket?.emit('room:created', room);
      onCreated(room);
      notify.success('Кімнату створено');
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Не вдалося створити кімнату');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    // overlay
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-sm rounded-lg p-6 ${
          isDark ? 'bg-[#2b2d31]' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()} // не закривати при кліку на модалку
      >
        <h2
          className={`text-lg font-medium mb-1 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
        >
          Create Room
        </h2>
        <p
          className={`text-sm mb-5 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          Створи нову кімнату для спілкування
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              className={`text-xs font-medium tracking-wide ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              НАЗВА КІМНАТИ
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="наприклад: general"
              className={`text-sm px-3 py-2.5 rounded-md outline-none border border-transparent focus:border-[#5865f2] ${
                isDark
                  ? 'bg-[#1e1f22] text-white placeholder-gray-600'
                  : 'bg-gray-100 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className={`text-xs font-medium tracking-wide ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              ОПИС (необов'язково)
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Про що ця кімната?"
              className={`text-sm px-3 py-2.5 rounded-md outline-none border border-transparent focus:border-[#5865f2] ${
                isDark
                  ? 'bg-[#1e1f22] text-white placeholder-gray-600'
                  : 'bg-gray-100 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-2 justify-end mt-1">
            <button
              type="button"
              onClick={onClose}
              className={`text-sm px-4 py-2 rounded-md ${
                isDark
                  ? 'text-gray-400 hover:bg-[#35373c]'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white text-sm px-4 py-2 rounded-md transition-colors"
            >
              {isLoading ? 'Створення...' : 'Створити'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
