import type { UserProfile } from '../types/user';

const API_URL = import.meta.env.VITE_API_URL;

export async function fetchAllUsers(token: string): Promise<UserProfile[]> {
  const res = await fetch(`${API_URL}/user/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function fetchUserById(
  token: string,
  userId: string,
): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

export async function fetchMe(token: string): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/user/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function updateMe(
  token: string,
  data: { bio?: string; avatar?: string },
): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/user/me`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}
