import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppLoader } from './AppLoader';

type Props = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: Props) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <AppLoader label="Завантаження чату…" variant="fullscreen" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}