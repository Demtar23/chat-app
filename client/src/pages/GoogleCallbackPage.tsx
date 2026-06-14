/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';
import { getAuthPage } from '../styles/authPageClasses';
import { useTranslation } from 'react-i18next';

type Status = 'loading' | 'error';

export function GoogleCallbackPage() {
  const { t } = useTranslation();
  const { isDark } = useThemeContext();
  const ap = getAuthPage(isDark);
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const hasRun = useRef(false);

  const errorParam = searchParams.get('error');
  const token = searchParams.get('token');
  const refreshToken = searchParams.get('refresh');

  const [status, setStatus] = useState<Status>(
    errorParam || !token ? 'error' : 'loading',
  );
  const [errorMessage, setErrorMessage] = useState(
    errorParam
      ? t('googleCallback.errorGoogle')
      : !token
        ? t('googleCallback.errorNoToken')
        : '',
  );

  useEffect(() => {
    if (hasRun.current || status === 'error') return;
    hasRun.current = true;

    if (!token || !refreshToken) {
      setStatus('error');
      setErrorMessage(t('googleCallback.errorNoToken'));
      return;
    }

    try {
      const parts = token.split('.');
      const payload = JSON.parse(atob(parts[1]));

      // зберігаємо refresh через наш proxy (той самий домен)
      fetch(`${import.meta.env.VITE_API_URL}/auth/set-refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ refreshToken }),
      }).then(() => {
        login({ id: payload.id, username: payload.username }, token);
        navigate('/chat');
      });
    } catch {
      setStatus('error');
      setErrorMessage(t('googleCallback.errorFinish'));
    }
  }, []);

  if (status === 'error') {
    return (
      <div className={ap.page}>
        <div className={ap.cardCenter}>
          <div className="text-4xl mb-4">❌</div>
          <h1 className={ap.title}>{t('googleCallback.errorTitle')}</h1>
          <p className={`${ap.subtitle} mb-6`}>{errorMessage}</p>
          <Link to="/login" className={`text-sm ${ap.link}`}>
            {t('auth.backToLogin')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={ap.page}>
      <div className={ap.cardCenter}>
        <div className="flex justify-center mb-4">
          <div className="w-10 h-10 border-2 border-[#5865f2] border-t-transparent rounded-full animate-spin" />
        </div>
        <h1 className={ap.title}>{t('googleCallback.title')}</h1>
        <p className={ap.subtitle}>{t('googleCallback.loading')}</p>
      </div>
    </div>
  );
}
