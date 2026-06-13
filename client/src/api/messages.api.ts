import type { Message } from '../types/message';
import { fetchWithAuth } from './fetchWithAuth';

// const API_URL = import.meta.env.VITE_API_URL;

export async function fetchGlobalMessages(
  token: string,
  beforeId?: string,
): Promise<Message[]> {
  const params = new URLSearchParams();
  if (beforeId) params.append('before', beforeId);

  const res = await fetchWithAuth(
    `/api/messages/global?${params}`,
    {},
    token,
  );
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

export async function fetchRoomMessages(
  token: string,
  roomId: string,
  beforeId?: string,
): Promise<Message[]> {
  const params = new URLSearchParams();
  if (beforeId) params.append('before', beforeId);

  const res = await fetchWithAuth(
    `/api/messages/room/${roomId}?${params}`,
    {},
    token,
  );
  if (!res.ok) throw new Error('Failed to fetch room messages');
  return res.json();
}

export async function fetchPrivateMessages(
  token: string,
  userId: string,
  beforeId?: string,
): Promise<Message[]> {
  const params = new URLSearchParams();
  if (beforeId) params.append('before', beforeId);

  const res = await fetchWithAuth(
    `/api/messages/private/${userId}?${params}`,
    {},
    token,
  );
  if (!res.ok) throw new Error('Failed to fetch private messages');
  return res.json();
}

export async function fetchMessagesAround(
  token: string,
  messageId: string,
  type: 'global' | 'room' | 'private',
  roomId?: string,
  userId?: string,
): Promise<Message[]> {
  const params = new URLSearchParams({ type });
  if (roomId) params.append('roomId', roomId);
  if (userId) params.append('userId', userId);

  const res = await fetchWithAuth(
    `/api/messages/around/${messageId}?${params}`,
    {},
    token,
  );
  if (!res.ok) throw new Error('Failed to fetch messages around');
  return res.json();
}

export async function fetchPinnedMessages(
  token: string,
  type: 'global' | 'room' | 'private',
  roomId?: string,
  userId?: string,
): Promise<Message[]> {
  const params = new URLSearchParams({ type });
  if (roomId) params.append('roomId', roomId);
  if (userId) params.append('userId', userId);

  const res = await fetchWithAuth(
    `/api/messages/pinned?${params}`,
    {},
    token,
  );
  if (!res.ok) throw new Error('Failed to fetch pinned messages');
  return res.json();
}

export async function searchMessages(
  token: string,
  type: 'global' | 'room' | 'private',
  query: string,
  roomId?: string,
  userId?: string,
): Promise<Message[]> {
  const params = new URLSearchParams({ q: query, type });
  if (roomId) params.append('roomId', roomId);
  if (userId) params.append('userId', userId);

  const res = await fetchWithAuth(
    `/api/messages/search?${params}`,
    {},
    token,
  );
  if (!res.ok) throw new Error('Failed to search messages');
  return res.json();
}
