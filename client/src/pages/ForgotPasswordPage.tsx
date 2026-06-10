import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiForgotPassword } from '../api/auth.api';
import { useFormField } from '../hooks/useFormField';
import { notify } from '../utils/toast';
import { forgotPasswordSchema } from '../validations/auth.schema';
import { useThemeContext } from '../context/ThemeContext';
import { getAuthPage } from '../styles/authPageClasses';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTranslation } from 'react-i18next';
import { LangToggle } from '../components/LangToggle';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { isDark } = useThemeContext();
  const ap = getAuthPage(isDark);
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const email = useFormField(forgotPasswordSchema.shape.email);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.validateNow()) return;
    setIsLoading(true);
    try {
      await apiForgotPassword(email.value);
      setIsSent(true);
    } catch (err) {
      notify.error(err instanceof Error ? err.message : t('forgotPassword.errorMsg'));
    } finally {
      setIsLoading(false);
    }
  }

  if (isSent) {
    return (
      <div className={`relative ${ap.page}`}>
        <div className="absolute top-4 right-4 flex items-center gap-2">
        <LangToggle />
        <ThemeToggle />
      </div>
        <div className={ap.cardCenter}>
          <div className="text-4xl mb-4">📧</div>
          <h1 className={ap.title}>{t('forgotPassword.sentTitle')}</h1>
          <p className={`${ap.subtitle} mb-6`}>
            {t('forgotPassword.sentDesc')}{' '}
            <span className={isDark ? 'text-white' : 'text-gray-900'}>
              {email.value}
            </span>{' '}
            {t('forgotPassword.sentDesc2')}
          </p>
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
        <h1 className={ap.title}>{t('forgotPassword.title')}</h1>
        <p className={ap.subtitle}>
          {t('forgotPassword.subtitle')}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={ap.label}>{t('auth.email')}</label>
            <input
              type="email"
              value={email.value}
              onChange={email.onChange}
              onBlur={email.onBlur}
              className={ap.input(email.error)}
              placeholder={t('loginPage.emailPlaceholder')}
              autoComplete="email"
            />
            {email.error && (
              <p className="text-red-400 text-xs">{email.error}</p>
            )}
          </div>

          <button type="submit" disabled={isLoading} className={ap.submitBtn}>
            {isLoading ? t('forgotPassword.sending') : t('forgotPassword.submitBtn')}
          </button>
        </form>

        <p className={ap.mutedText}>
          <Link to="/login" className={ap.link}>
            {t('auth.backToLogin')}
          </Link>
        </p>
      </div>
    </div>
  );
}
