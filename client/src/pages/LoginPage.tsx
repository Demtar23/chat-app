import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiLogin } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';
import { notify } from '../utils/toast';
import { useFormField } from '../hooks/useFormField';
import { loginSchema } from '../validations/auth.schema';
import { useThemeContext } from '../context/ThemeContext';
import { getAuthPage } from '../styles/authPageClasses';
import { ThemeToggle } from '../components/Chat/components/ThemeToggle';
import { useTranslation } from 'react-i18next';
import { LangToggle } from '../components/LangToggle';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const GoogleIcon = () => (
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
);

export function LoginPage() {
  const { t } = useTranslation();
  const { isDark } = useThemeContext();
  const ap = getAuthPage(isDark);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const email = useFormField(loginSchema.shape.email);
  const password = useFormField(loginSchema.shape.password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.validateNow() || !password.validateNow()) return;

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
    <div className={`relative ${ap.page}`}>
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LangToggle />
        <ThemeToggle />
      </div>

      <div className={ap.card}>
        <h1 className={ap.title}>{t('loginPage.title')}</h1>
        <p className={ap.subtitle}>{t('loginPage.subtitle')}</p>

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label className={ap.label}>{t('auth.email')}</label>
            <input
              type="email"
              value={email.value}
              onChange={email.onChange}
              onBlur={email.onBlur}
              className={ap.input(email.error)}
              placeholder="your@email.com"
              autoComplete="email"
            />
            {email.error && (
              <p className="text-red-400 text-xs mt-0.5">{email.error}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={ap.label}>{t('auth.password')}</label>
            <input
              type="password"
              value={password.value}
              onChange={password.onChange}
              onBlur={password.onBlur}
              className={ap.input(password.error)}
              placeholder="Введи пароль"
              autoComplete="current-password"
            />
            {password.error && (
              <p className="text-red-400 text-xs mt-0.5">{password.error}</p>
            )}
          </div>

          <div className="flex justify-end -mt-2">
            <Link to="/forgot-password" className={`text-xs ${ap.link}`}>
              {t('auth.forgotPassword')}
            </Link>
          </div>

          <button type="submit" disabled={isLoading} className={ap.submitBtn}>
            {isLoading ? t('loginPage.loading') : t('loginPage.submitBtn')}
          </button>
        </form>

        <div className={ap.divider.wrapper}>
          <div className={ap.divider.line}>
            <div className={ap.divider.lineInner} />
          </div>
          <div className={ap.divider.label}>
            <span className={ap.divider.labelInner}>{t('auth.or')}</span>
          </div>
        </div>

        <a href={`${BACKEND_URL}/api/auth/google`} className={ap.googleBtn}>
          <GoogleIcon />
          {t('auth.loginGoogle')}
        </a>

        <p className={ap.mutedText}>
          {t('auth.noAccount')}{' '}
          <Link to="/register" className={ap.link}>
            {t('auth.register')}
          </Link>
        </p>
      </div>
    </div>
  );
}
