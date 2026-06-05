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

export async function uploadAvatar(
  file: File,
  token: string,
): Promise<{ avatar: string }> {
  const formData = new FormData();
  formData.append('avatar', file);

  const res = await fetchWithAuth(
    `${API_URL}/user/me/avatar`,
    {
      method: 'POST',
      body: formData,
      // не додаємо Content-Type — браузер сам додасть multipart/form-data з boundary
    },
    token,
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message ?? 'Upload failed');
  }

  return res.json();
}

export async function deleteAvatarApi(token: string): Promise<void> {
  const res = await fetchWithAuth(
    `${API_URL}/user/me/avatar`,
    { method: 'DELETE' },
    token,
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message ?? 'Delete failed');
  }
}
