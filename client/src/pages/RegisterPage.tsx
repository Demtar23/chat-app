import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRegister } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { user, accessToken } = await apiRegister(username, password);
      login(user, accessToken);
      navigate('/chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
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
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-[#1e1f22] text-white text-sm px-3 py-2.5 rounded-md outline-none border border-transparent focus:border-[#5865f2] placeholder-gray-600"
              placeholder="Введи username"
              autoComplete="username"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-400 tracking-wide">
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#1e1f22] text-white text-sm px-3 py-2.5 rounded-md outline-none border border-transparent focus:border-[#5865f2] placeholder-gray-600"
              placeholder="Введи пароль"
              autoComplete="new-password"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-md transition-colors mt-1"
          >
            {isLoading ? 'Loading...' : 'Зареєструватись'}
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
