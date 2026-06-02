import type { Message } from '../types/message';
import { fetchWithAuth } from './fetchWithAuth';

const API_URL = import.meta.env.VITE_API_URL;

// cursor-based — beforeId = _id найстарішого повідомлення в списку
export async function fetchGlobalMessages(
  token: string,
  beforeId?: string,
): Promise<Message[]> {
  const params = new URLSearchParams();
  if (beforeId) params.append('before', beforeId);

  const res = await fetchWithAuth(
    `${API_URL}/messages/global?${params}`,
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
    `${API_URL}/messages/room/${roomId}?${params}`,
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
    `${API_URL}/messages/private/${userId}?${params}`,
    {},
    token,
  );
  if (!res.ok) throw new Error('Failed to fetch private messages');
  return res.json();
}

// завантажити повідомлення навколо конкретного (для pin/search навігації)
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
    `${API_URL}/messages/around/${messageId}?${params}`,
    {},
    token,
  );
  if (!res.ok) throw new Error('Failed to fetch messages around');
  return res.json();
}

export async function toggleReaction(
  token: string,
  messageId: string,
  emoji: string,
): Promise<Message> {
  const res = await fetchWithAuth(
    `${API_URL}/messages/${messageId}/react`,
    { method: 'POST', body: JSON.stringify({ emoji }) },
    token,
  );
  if (!res.ok) throw new Error('Failed to toggle reaction');
  return res.json();
}

export async function editMessage(
  token: string,
  messageId: string,
  text: string,
): Promise<Message> {
  const res = await fetchWithAuth(
    `${API_URL}/messages/${messageId}`,
    { method: 'PATCH', body: JSON.stringify({ text }) },
    token,
  );
  if (!res.ok) throw new Error('Failed to edit message');
  return res.json();
}

export async function deleteMessageForAll(
  token: string,
  messageId: string,
): Promise<Message> {
  const res = await fetchWithAuth(
    `${API_URL}/messages/${messageId}`,
    { method: 'DELETE' },
    token,
  );
  if (!res.ok) throw new Error('Failed to delete message');
  return res.json();
}

export async function deleteMessageForMe(
  token: string,
  messageId: string,
): Promise<Message> {
  const res = await fetchWithAuth(
    `${API_URL}/messages/${messageId}/me`,
    { method: 'DELETE' },
    token,
  );
  if (!res.ok) throw new Error('Failed to delete message');
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
    `${API_URL}/messages/pinned?${params}`,
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
    `${API_URL}/messages/search?${params}`,
    {},
    token,
  );
  if (!res.ok) throw new Error('Failed to search messages');
  return res.json();
}
