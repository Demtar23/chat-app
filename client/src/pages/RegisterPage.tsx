import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRegister } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';
import { notify } from '../utils/toast';
import { useFormField } from '../hooks/useFormField';
import { registerSchema } from '../validations/auth.schema';

function inputClass(error: string) {
  return `bg-[#1e1f22] text-white text-sm px-3 py-2.5 rounded-md outline-none border transition-colors placeholder-gray-600 ${
    error
      ? 'border-red-500 focus:border-red-400'
      : 'border-transparent focus:border-[#5865f2]'
  }`;
}

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const username = useFormField(registerSchema.shape.username);
  const password = useFormField(registerSchema.shape.password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const isUsernameValid = username.validateNow();
    const isPasswordValid = password.validateNow();
    if (!isUsernameValid || !isPasswordValid) return;

    setIsLoading(true);
    try {
      const { user, accessToken } = await apiRegister(
        username.value,
        password.value,
      );
      login(user, accessToken);
      navigate('/chat');
      notify.success('Profile created successfully');
    } catch (err) {
      notify.error(
        err instanceof Error ? err.message : 'Не вдалося зареєструватись',
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-[#1e1f22]">
      <div className="bg-[#2b2d31] rounded-lg p-8 w-full max-w-sm border border-[#1e1f22]">
        <h1 className="text-white text-xl font-medium mb-1">Створити акаунт</h1>
        <p className="text-gray-400 text-sm mb-6">Приєднуйся до чату!</p>

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-400 tracking-wide">
              USERNAME
            </label>
            <input
              value={username.value}
              onChange={username.onChange}
              onBlur={username.onBlur}
              className={inputClass(username.error)}
              placeholder="3-20 символів, тільки літери, цифри, _ та -"
              autoComplete="username"
            />
            {username.error && (
              <p className="text-red-400 text-xs mt-0.5">{username.error}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-400 tracking-wide">
              PASSWORD
            </label>
            <input
              type="password"
              value={password.value}
              onChange={password.onChange}
              onBlur={password.onBlur}
              className={inputClass(password.error)}
              placeholder="Мін. 8 символів, велика/мала літера, цифра, спецсимвол"
              autoComplete="new-password"
            />
            {password.error && (
              <p className="text-red-400 text-xs mt-0.5">{password.error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-md transition-colors mt-1"
          >
            {isLoading ? 'Завантаження...' : 'Зареєструватись'}
          </button>
        </form>

        <p className="text-gray-500 text-sm mt-4 text-center">
          Вже є акаунт?{' '}
          <Link to="/login" className="text-[#5865f2] hover:underline">
            Увійти
          </Link>
        </p>
      </div>
    </div>
  );
}
