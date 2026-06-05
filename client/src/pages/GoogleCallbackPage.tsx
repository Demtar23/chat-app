import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRefresh } from '../api/auth.api';

type Status = 'loading' | 'error';

export function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const hasRun = useRef(false);

  const errorParam = searchParams.get('error');
  const token = searchParams.get('token');

  const [status, setStatus] = useState<Status>(
    errorParam || !token ? 'error' : 'loading',
  );
  const [errorMessage, setErrorMessage] = useState(
    errorParam
      ? 'Не вдалося увійти через Google. Спробуй ще раз.'
      : !token
        ? 'Токен не отримано'
        : '',
  );

  useEffect(() => {
    if (hasRun.current || status === 'error') return;
    hasRun.current = true;

    apiRefresh()
      .then(({ user, accessToken }) => {
        login(user, accessToken);
        navigate('/chat');
      })
      .catch(() => {
        setStatus('error');
        setErrorMessage('Не вдалося завершити вхід');
      });
  }, []);

  if (status === 'error') {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1e1f22]">
        <div className="bg-[#2b2d31] rounded-lg p-8 w-full max-w-sm border border-[#1e1f22] text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-white text-xl font-medium mb-2">Помилка входу</h1>
          <p className="text-gray-400 text-sm mb-6">{errorMessage}</p>
          <a href="/login" className="text-[#5865f2] hover:underline text-sm">
            Повернутись до входу
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-[#1e1f22]">
      <div className="bg-[#2b2d31] rounded-lg p-8 w-full max-w-sm border border-[#1e1f22] text-center">
        <div className="flex justify-center mb-4">
          <div className="w-10 h-10 border-2 border-[#5865f2] border-t-transparent rounded-full animate-spin" />
        </div>
        <h1 className="text-white text-xl font-medium mb-2">
          Вхід через Google
        </h1>
        <p className="text-gray-400 text-sm">Завершуємо авторизацію...</p>
      </div>
    </div>
  );
}
