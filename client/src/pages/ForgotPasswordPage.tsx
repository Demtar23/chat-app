import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiForgotPassword } from '../api/auth.api';
import { useFormField } from '../hooks/useFormField';
import { notify } from '../utils/toast';
import { forgotPasswordSchema } from '../validations/auth.schema';

export function ForgotPasswordPage() {
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
      notify.error(err instanceof Error ? err.message : 'Щось пішло не так');
    } finally {
      setIsLoading(false);
    }
  }

  if (isSent) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1e1f22]">
        <div className="bg-[#2b2d31] rounded-lg p-8 w-full max-w-sm border border-[#1e1f22] text-center">
          <div className="text-4xl mb-4">📧</div>
          <h1 className="text-white text-xl font-medium mb-2">Перевір пошту</h1>
          <p className="text-gray-400 text-sm mb-6">
            Якщо акаунт з адресою{' '}
            <span className="text-white">{email.value}</span> існує, ми
            надіслали інструкції для скидання пароля.
          </p>
          <Link to="/login" className="text-[#5865f2] hover:underline text-sm">
            Повернутись до входу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-[#1e1f22]">
      <div className="bg-[#2b2d31] rounded-lg p-8 w-full max-w-sm border border-[#1e1f22]">
        <h1 className="text-white text-xl font-medium mb-1">Забули пароль?</h1>
        <p className="text-gray-400 text-sm mb-6">
          Введи свій email і ми надішлемо посилання для скидання пароля.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-400 tracking-wide">
              EMAIL
            </label>
            <input
              type="email"
              value={email.value}
              onChange={email.onChange}
              onBlur={email.onBlur}
              className={`bg-[#1e1f22] text-white text-sm px-3 py-2.5 rounded-md outline-none border transition-colors placeholder-gray-600 ${
                email.error
                  ? 'border-red-500'
                  : 'border-transparent focus:border-[#5865f2]'
              }`}
              placeholder="your@email.com"
              autoComplete="email"
            />
            {email.error && (
              <p className="text-red-400 text-xs">{email.error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-md transition-colors"
          >
            {isLoading ? 'Надсилання...' : 'Надіслати посилання'}
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
