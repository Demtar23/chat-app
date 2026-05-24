import type { Room } from '../types/room';
import { fetchWithAuth } from './fetchWithAuth';

const API_URL = import.meta.env.VITE_API_URL;

export async function fetchRooms(token: string): Promise<Room[]> {
  const res = await fetchWithAuth(`${API_URL}/rooms`, {}, token);

  if (!res.ok) {
    throw new Error('Failed to fetch rooms');
  }

  return res.json();
}

export async function createRoom(
  token: string,
  name: string,
  description: string,
): Promise<Room> {
  const res = await fetchWithAuth(
    `${API_URL}/rooms`,
    {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    },
    token,
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }

  return res.json();
}

export async function joinRoom(token: string, roomId: string): Promise<Room> {
  const res = await fetchWithAuth(
    `${API_URL}/rooms/${roomId}/join`,
    {
      method: 'POST',
    },
    token,
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }

  return res.json();
}

export async function leaveRoom(token: string, roomId: string): Promise<Room> {
  const res = await fetchWithAuth(
    `${API_URL}/rooms/${roomId}/leave`,
    {
      method: 'POST',
    },
    token,
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }

  return res.json();
}
