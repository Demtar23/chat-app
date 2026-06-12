import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFormField } from '../hooks/useFormField';
import { setupProfileSchema } from '../validations/auth.schema';
import { notify } from '../utils/toast';
import { useThemeContext } from '../context/ThemeContext';
import { getAuthPage } from '../styles/authPageClasses';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTranslation } from 'react-i18next';
import { LangToggle } from '../components/LangToggle';
import { getTheme } from '../styles/theme';

const API_URL = import.meta.env.VITE_API_URL;

export function SetupProfilePage() {
  const { t } = useTranslation();
  const { isDark } = useThemeContext();
  const theme = getTheme(isDark);
  const ap = getAuthPage(isDark);
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
      if (!res.ok) throw new Error(data.message ?? t('notify.error'));

      login(data.user, data.accessToken);
      navigate('/chat');
      notify.success(t('setupProfile.successMsg'));
    } catch {
      notify.error(t('setupProfile.errorMsg'));
    } finally {
      setIsLoading(false);
    }
  }

  if (!setupToken) {
    return (
      <div className={`relative ${ap.page}`}>
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <LangToggle />
          <ThemeToggle />
        </div>
        <div className={ap.cardCenter}>
          <div className="text-4xl mb-4">❌</div>
          <h1 className={ap.title}>{t('setupProfile.invalidLink')}</h1>
          <Link to="/login" className={`text-sm ${ap.link}`}>
            {t('auth.backToLogin')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${ap.page}`}>
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LangToggle />
        <ThemeToggle />
      </div>
      <div className={ap.card}>
        <div className="text-3xl mb-4 text-center">👋</div>
        <h1 className={`${ap.title} text-center`}>{t('setupProfile.title')}</h1>
        <p className={`${ap.subtitle} text-center`}>
          {t('setupProfile.subtitle')}
        </p>
        <p
          className={`text-xs mb-6 text-center ${theme.textFaintest}`}
        >
          {t('setupProfile.warning')}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={ap.label}>{t('auth.username')}</label>
            <input
              value={username.value}
              onChange={username.onChange}
              onBlur={username.onBlur}
              className={ap.input(username.error)}
              placeholder={t('registerPage.usernamePlaceholder')}
              autoComplete="username"
            />
            {username.error && (
              <p className="text-red-400 text-xs">{username.error}</p>
            )}
          </div>

          <button type="submit" disabled={isLoading} className={ap.submitBtn}>
            {isLoading
              ? t('setupProfile.creating')
              : t('setupProfile.submitBtn')}
          </button>
        </form>
      </div>
    </div>
  );
}
