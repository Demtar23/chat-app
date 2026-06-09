import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ChatPage } from './pages/ChatPage';
import NotFoundPage from './pages/NotFoundPage';
import { ActivationPage } from './pages/ActivationPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { GoogleCallbackPage } from './pages/GoogleCallbackPage';
import { SetupProfilePage } from './pages/SetupProfilePage';
import { ThemeProvider } from './context/ThemeContext';
import { ToastWrapper } from './components/ToastWrapper';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastWrapper />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/auth/activation/:token"
              element={<ActivationPage />}
            />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/auth/reset-password/:token"
              element={<ResetPasswordPage />}
            />
            <Route path="/auth/callback" element={<GoogleCallbackPage />} />
            <Route path="/auth/setup-profile" element={<SetupProfilePage />} />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
