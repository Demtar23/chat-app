import { createContext, useContext, useEffect, useState } from 'react';
import { apiRefresh, apiLogout } from '../api/auth.api';
import { connectSocket, disconnectSocket } from '../services/socket';

type User = {
  id: string;
  username: string;
};

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiRefresh()
      .then(({ user, accessToken }) => {
        setUser(user);
        setAccessToken(accessToken);
        connectSocket(accessToken);
      })
      .catch((err) => {
        console.log('Refresh failed:', err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  function login(user: User, token: string) {
    setUser(user);
    setAccessToken(token);
    connectSocket(token);
  }

  async function logout() {
    await apiLogout();
    setUser(null);
    setAccessToken(null);
    disconnectSocket();
  }

  return (
    <AuthContext.Provider
      value={{ user, accessToken, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
