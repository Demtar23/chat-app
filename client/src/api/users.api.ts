import type { UserProfile } from '../types/user';
import { fetchWithAuth } from './fetchWithAuth';

const API_URL = import.meta.env.VITE_API_URL;

export async function fetchAllUsers(token: string): Promise<UserProfile[]> {
  const res = await fetchWithAuth(`${API_URL}/user/all`, {}, token);

  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function fetchUserById(
  token: string,
  userId: string,
): Promise<UserProfile> {
  const res = await fetchWithAuth(`${API_URL}/user/${userId}`, {}, token);

  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

export async function fetchMe(token: string): Promise<UserProfile> {
  const res = await fetchWithAuth(`${API_URL}/user/me`, {}, token);

  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function updateMe(
  token: string,
  data: { bio?: string; avatar?: string | null; bannerColor?: string | null },
): Promise<UserProfile> {
  const res = await fetchWithAuth(
    `${API_URL}/user/me`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
    token,
  );

  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}
