import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFormField } from '../hooks/useFormField';
import { setupProfileSchema } from '../validations/auth.schema';
import { notify } from '../utils/toast';

const API_URL = import.meta.env.VITE_API_URL;

export function SetupProfilePage() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const setupToken = searchParams.get('setup_token') ?? '';
  const username = useFormField(setupProfileSchema.shape.username);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.validateNow()) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/setup-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          setup_token: setupToken,
          username: username.value,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Помилка');

      login(data.user, data.accessToken);
      navigate('/chat');
      notify.success('Акаунт створено!');
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Щось пішло не так');
    } finally {
      setIsLoading(false);
    }
  }

  if (!setupToken) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1e1f22]">
        <div className="bg-[#2b2d31] rounded-lg p-8 w-full max-w-sm border border-[#1e1f22] text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-white text-xl font-medium mb-2">
            Невалідне посилання
          </h1>
          <a href="/login" className="text-[#5865f2] hover:underline text-sm">
            Повернутись до входу
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-[#1e1f22]">
      <div className="bg-[#2b2d31] rounded-lg p-8 w-full max-w-sm border border-[#1e1f22]">
        <div className="text-3xl mb-4 text-center">👋</div>
        <h1 className="text-white text-xl font-medium mb-1 text-center">
          Майже готово!
        </h1>
        <p className="text-gray-400 text-sm mb-2 text-center">
          Обери собі унікальний username.
        </p>
        <p className="text-gray-600 text-xs mb-6 text-center">
          ⚠️ Username не можна змінити після створення акаунту.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-400 tracking-wide">
              USERNAME
            </label>
            <input
              value={username.value}
              onChange={username.onChange}
              onBlur={username.onBlur}
              className={`bg-[#1e1f22] text-white text-sm px-3 py-2.5 rounded-md outline-none border transition-colors placeholder-gray-600 ${
                username.error
                  ? 'border-red-500'
                  : 'border-transparent focus:border-[#5865f2]'
              }`}
              placeholder="3-20 символів, тільки літери, цифри, _ та -"
              autoComplete="username"
            />
            {username.error && (
              <p className="text-red-400 text-xs">{username.error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-md transition-colors"
          >
            {isLoading ? 'Створення...' : 'Створити акаунт'}
          </button>
        </form>
      </div>
    </div>
  );
}
