import { fetchWithAuth } from './fetchWithAuth';

const API_URL = import.meta.env.VITE_API_URL;

type AuthResponse = {
  user: {
    id: string;
    username: string;
  };
  accessToken: string;
};

export async function apiRegister(
  username: string,
  email: string,
  password: string,
) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // для cookie
    body: JSON.stringify({ username, email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }

  return res.json();
}

export async function apiLogin(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }

  return res.json();
}

export async function apiRefresh(): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Session expired');
  }

  return res.json();
}

export async function apiLogout(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

export async function apiVerifyEmail(token: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/verify-email/${token}`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }

  return res.json();
}

export async function apiChangePassword(
  oldPassword: string,
  newPassword: string,
  accessToken: string,
): Promise<void> {
  const res = await fetchWithAuth(
    `${API_URL}/auth/change-password`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword, newPassword }),
    },
    accessToken,
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }
}

export async function apiForgotPassword(email: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }
}

export async function apiResetPassword(
  token: string,
  newPassword: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/auth/reset-password/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newPassword }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }
}
