import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppLoader } from './AppLoader';
import { useTranslation } from 'react-i18next';

type Props = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: Props) {
  const { user, isLoading } = useAuth();

  const { t } = useTranslation();

  if (isLoading) {
    return <AppLoader label={t('app.loadingChat')} variant="fullscreen" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}