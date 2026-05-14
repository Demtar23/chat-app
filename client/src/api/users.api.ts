import type { UserProfile } from '../types/user';

const API_URL = 'http://localhost:5000/api';

export async function fetchAllUsers(token: string): Promise<UserProfile[]> {
  const res = await fetch(`${API_URL}/user/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch users');
  }

  return res.json();
}
