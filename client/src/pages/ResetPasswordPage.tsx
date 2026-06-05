import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiResetPassword } from '../api/auth.api';
import { useFormField } from '../hooks/useFormField';
import { resetPasswordSchema } from '../validations/auth.schema';
import { notify } from '../utils/toast';

export function ResetPasswordPage() {
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
      notify.success('Пароль успішно змінено');
      navigate('/login');
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Щось пішло не так');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-[#1e1f22]">
      <div className="bg-[#2b2d31] rounded-lg p-8 w-full max-w-sm border border-[#1e1f22]">
        <h1 className="text-white text-xl font-medium mb-1">Новий пароль</h1>
        <p className="text-gray-400 text-sm mb-6">
          Введи новий пароль для свого акаунту.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-400 tracking-wide">
              НОВИЙ ПАРОЛЬ
            </label>
            <input
              type="password"
              value={newPassword.value}
              onChange={newPassword.onChange}
              onBlur={newPassword.onBlur}
              className={`bg-[#1e1f22] text-white text-sm px-3 py-2.5 rounded-md outline-none border transition-colors placeholder-gray-600 ${
                newPassword.error
                  ? 'border-red-500'
                  : 'border-transparent focus:border-[#5865f2]'
              }`}
              placeholder="Мін. 8 символів, велика/мала літера, цифра, спецсимвол"
              autoComplete="new-password"
            />
            {newPassword.error && (
              <p className="text-red-400 text-xs">{newPassword.error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-md transition-colors"
          >
            {isLoading ? 'Збереження...' : 'Зберегти пароль'}
          </button>
        </form>

        <p className="text-gray-500 text-sm mt-4 text-center">
          <Link to="/login" className="text-[#5865f2] hover:underline">
            Повернутись до входу
          </Link>
        </p>
      </div>
    </div>
  );
}
