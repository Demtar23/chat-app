import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiLogin } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';
import { notify } from '../utils/toast';
import { useFormField } from '../hooks/useFormField';
import { loginSchema } from '../validations/auth.schema';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function inputClass(error: string) {
  return `bg-[#1e1f22] text-white text-sm px-3 py-2.5 rounded-md outline-none border transition-colors placeholder-gray-600 ${
    error
      ? 'border-red-500 focus:border-red-400'
      : 'border-transparent focus:border-[#5865f2]'
  }`;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const email = useFormField(loginSchema.shape.email);
  const password = useFormField(loginSchema.shape.password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const isEmailValid = email.validateNow();
    const isPasswordValid = password.validateNow();
    if (!isEmailValid || !isPasswordValid) return;

    setIsLoading(true);
    try {
      const { user, accessToken } = await apiLogin(email.value, password.value);
      login(user, accessToken);
      navigate('/chat');
      notify.success('Вхід успішний');
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Не вдалося увійти');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-[#1e1f22]">
      <div className="bg-[#2b2d31] rounded-lg p-8 w-full max-w-sm border border-[#1e1f22]">
        <h1 className="text-white text-xl font-medium mb-1">Welcome back</h1>
        <p className="text-gray-400 text-sm mb-6">Раді бачити тебе знову!</p>

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-400 tracking-wide">
              EMAIL
            </label>
            <input
              type="email"
              value={email.value}
              onChange={email.onChange}
              onBlur={email.onBlur}
              className={inputClass(email.error)}
              placeholder="your@email.com"
              autoComplete="email"
            />
            {email.error && (
              <p className="text-red-400 text-xs mt-0.5">{email.error}</p>
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
              placeholder="Введи пароль"
              autoComplete="current-password"
            />
            {password.error && (
              <p className="text-red-400 text-xs mt-0.5">{password.error}</p>
            )}
          </div>

          <div className="flex justify-end -mt-2">
            <Link
              to="/forgot-password"
              className="text-xs text-[#5865f2] hover:underline"
            >
              Забули пароль?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-md transition-colors"
          >
            {isLoading ? 'Завантаження...' : 'Увійти'}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-2 text-xs bg-[#2b2d31] text-gray-500">або</span>
          </div>
        </div>

        <a
          href={`${BACKEND_URL}/api/auth/google`}
          className="flex items-center justify-center gap-3 w-full py-2.5 rounded-md border border-gray-600 text-gray-300 text-sm font-medium hover:bg-[#35373c] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Увійти через Google
        </a>

        <p className="text-gray-500 text-sm mt-5 text-center">
          Немає акаунту?{' '}
          <Link to="/register" className="text-[#5865f2] hover:underline">
            Зареєструватись
          </Link>
        </p>
      </div>
    </div>
  );
}
