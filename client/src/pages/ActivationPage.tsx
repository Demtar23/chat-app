import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiVerifyEmail } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';
import { notify } from '../utils/toast';
import { useThemeContext } from '../context/ThemeContext';
import { getAuthPage } from '../styles/authPageClasses';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTranslation } from 'react-i18next';
import { LangToggle } from '../components/LangToggle';

type Status = 'loading' | 'success' | 'error';

export function ActivationPage() {
  const { t } = useTranslation();
  const { isDark } = useThemeContext();
  const ap = getAuthPage(isDark);
  const { token } = useParams<{ token: string }>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>(token ? 'loading' : 'error');
  const [errorMessage, setErrorMessage] = useState(
    token ? '' : t('activation.invalidLink'),
  );

  useEffect(() => {
    if (!token) return;
    apiVerifyEmail(token)
      .then(({ user, accessToken }) => {
        login(user, accessToken);
        setStatus('success');
        notify.success(t('activation.successTitle'));
        setTimeout(() => navigate('/chat'), 1500);
      })
      .catch((err) => {
        setStatus('error');
        setErrorMessage(
          err instanceof Error ? err.message : t('setupProfile.errorMsg'),
        );
      });
  }, [token]);

  return (
    <div className={`relative ${ap.page}`}>
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LangToggle />
        <ThemeToggle />
      </div>
      <div className={ap.cardCenter}>
        {status === 'loading' && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 border-2 border-[#5865f2] border-t-transparent rounded-full animate-spin" />
            </div>
            <h1 className={ap.title}>{t('activation.title')}</h1>
            <p className={ap.subtitle}>{t('activation.checking')}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-4xl mb-4">✅</div>
            <h1 className={ap.title}>{t('activation.successTitle')}</h1>
            <p className={ap.subtitle}>{t('activation.successDesc')}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-4xl mb-4">❌</div>
            <h1 className={ap.title}>{t('activation.errorTitle')}</h1>
            <p className={`${ap.subtitle} mb-6`}>{errorMessage}</p>
            <Link to="/register" className={`inline-block text-sm ${ap.link}`}>
              {t('activation.registerAgain')}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
