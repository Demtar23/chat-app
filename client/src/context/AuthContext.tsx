import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { apiRefresh, apiLogout } from '../api/auth.api';
import {
  connectSocket,
  disconnectSocket,
  setTokenGetter,
} from '../services/socket';
import { setTokenRefreshCallback } from '../api/fetchWithAuth';

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
  refreshToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  useEffect(() => {
    setTokenGetter(() => accessToken);
  }, [accessToken]);

  useEffect(() => {
    apiRefresh()
      .then(({ user, accessToken }) => {
        setUser(user);
        setAccessToken(accessToken);
        connectSocket(accessToken);
        setTokenRefreshCallback((newToken) => {
          setAccessToken(newToken);
          connectSocket(newToken);
        });
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  function login(user: User, token: string) {
    setUser(user);
    setAccessToken(token);
    connectSocket(token);
    setTokenRefreshCallback((newToken) => {
      setAccessToken(newToken);
      connectSocket(newToken);
    });
  }

  async function logout() {
    await apiLogout();
    setUser(null);
    setAccessToken(null);
    disconnectSocket();
  }

  async function refreshToken(): Promise<string | null> {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    refreshPromiseRef.current = apiRefresh()
      .then(({ accessToken: newToken, user: newUser }) => {
        setAccessToken(newToken);
        setUser(newUser);
        connectSocket(newToken);
        return newToken;
      })
      .catch(() => {
        setUser(null);
        setAccessToken(null);
        disconnectSocket();
        return null;
      })
      .finally(() => {
        refreshPromiseRef.current = null;
      });

    return refreshPromiseRef.current;
  }

  return (
    <AuthContext.Provider
      value={{ user, accessToken, isLoading, login, logout, refreshToken }}
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
