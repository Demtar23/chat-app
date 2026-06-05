import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiVerifyEmail } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';
import { notify } from '../utils/toast';

type Status = 'loading' | 'success' | 'error';

export function ActivationPage() {
  const { token } = useParams<{ token: string }>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>(token ? 'loading' : 'error');
  const [errorMessage, setErrorMessage] = useState(
    token ? '' : 'Невалідне посилання активації',
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    apiVerifyEmail(token)
      .then(({ user, accessToken }) => {
        login(user, accessToken);
        setStatus('success');
        notify.success('Акаунт активовано!');
        setTimeout(() => navigate('/chat'), 1500);
      })
      .catch((err) => {
        setStatus('error');
        setErrorMessage(
          err instanceof Error ? err.message : 'Щось пішло не так',
        );
      });
  }, [token]);

  return (
    <div className="h-screen flex items-center justify-center bg-[#1e1f22]">
      <div className="bg-[#2b2d31] rounded-lg p-8 w-full max-w-sm border border-[#1e1f22] text-center">
        {status === 'loading' && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 border-2 border-[#5865f2] border-t-transparent rounded-full animate-spin" />
            </div>
            <h1 className="text-white text-xl font-medium mb-2">
              Активація акаунту
            </h1>
            <p className="text-gray-400 text-sm">Перевіряємо посилання...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-4xl mb-4">✅</div>
            <h1 className="text-white text-xl font-medium mb-2">
              Акаунт активовано!
            </h1>
            <p className="text-gray-400 text-sm">Перенаправляємо до чату...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-4xl mb-4">❌</div>
            <h1 className="text-white text-xl font-medium mb-2">
              Помилка активації
            </h1>
            <p className="text-gray-400 text-sm mb-6">{errorMessage}</p>
            <Link
              to="/register"
              className="inline-block text-[#5865f2] hover:underline text-sm"
            >
              Зареєструватись знову
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
