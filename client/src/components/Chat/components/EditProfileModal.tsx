import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { updateMe } from '../../../api/users.api';

type Props = {
  isDark: boolean;
  currentBio: string;
  onClose: () => void;
  onSaved: (bio: string) => void;
};

export function EditProfileModal({
  isDark,
  currentBio,
  onClose,
  onSaved,
}: Props) {
  const { accessToken } = useAuth();
  const [bio, setBio] = useState(currentBio);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;

    setIsLoading(true);
    setError('');

    try {
      const updated = await updateMe(accessToken, { bio: bio.trim() });
      onSaved(updated.bio ?? '');
      onClose();
    } catch {
      setError('Не вдалося зберегти');
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
        className={`w-full max-w-sm rounded-lg p-6 ${isDark ? 'bg-[#2b2d31]' : 'bg-white'}`}
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

          {error && <p className="text-red-400 text-sm">{error}</p>}

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
