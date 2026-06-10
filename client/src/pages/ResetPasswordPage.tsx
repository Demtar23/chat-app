import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiResetPassword } from '../api/auth.api';
import { useFormField } from '../hooks/useFormField';
import { resetPasswordSchema } from '../validations/auth.schema';
import { notify } from '../utils/toast';
import { useThemeContext } from '../context/ThemeContext';
import { getAuthPage } from '../styles/authPageClasses';
import { ThemeToggle } from '../components/ThemeToggle';
import { LangToggle } from '../components/LangToggle';
import { useTranslation } from 'react-i18next';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const { isDark } = useThemeContext();
  const ap = getAuthPage(isDark);
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const newPassword = useFormField(resetPasswordSchema.shape.newPassword);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword.validateNow() || !token) return;
    setIsLoading(true);
    try {
      await apiResetPassword(token, newPassword.value);
      notify.success(t('resetPassword.successMsg'));
      navigate('/login');
    } catch (err) {
      notify.error(err instanceof Error ? err.message : t('resetPassword.errorMsg'));
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
        <h1 className={ap.title}>{t('resetPassword.title')}</h1>
        <p className={ap.subtitle}>{t('resetPassword.subtitle')}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={ap.label}>{t('resetPassword.title')}</label>
            <input
              type="password"
              value={newPassword.value}
              onChange={newPassword.onChange}
              onBlur={newPassword.onBlur}
              className={ap.input(newPassword.error)}
              placeholder={t('resetPassword.placeholder')}
              autoComplete="new-password"
            />
            {newPassword.error && (
              <p className="text-red-400 text-xs">{newPassword.error}</p>
            )}
          </div>

          <button type="submit" disabled={isLoading} className={ap.submitBtn}>
            {isLoading ? t('resetPassword.saving'): t('resetPassword.submitBtn')}
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
