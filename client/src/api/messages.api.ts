import type { Message } from '../types/message';

const API_URL = import.meta.env.VITE_API_URL;

export async function fetchGlobalMessages(
  token: string,
  page = 1,
): Promise<Message[]> {
  const res = await fetch(`${API_URL}/messages/global?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch messages');
  }

  return res.json();
}

export async function fetchRoomMessages(
  token: string,
  roomId: string,
  page = 1,
): Promise<Message[]> {
  const res = await fetch(`${API_URL}/messages/room/${roomId}?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch room messages');
  }

  return res.json();
}

export async function fetchPrivateMessages(
  token: string,
  userId: string,
  page = 1,
): Promise<Message[]> {
  const res = await fetch(
    `${API_URL}/messages/private/${userId}?page=${page}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!res.ok) {
    throw new Error('Failed to fetch private messages');
  }

  return res.json();
}

export async function toggleReaction(
  token: string,
  messageId: string,
  emoji: string,
): Promise<Message> {
  const res = await fetch(`${API_URL}/messages/${messageId}/react`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ emoji }),
  });

  if (!res.ok) {
    throw new Error('Failed to toggle reaction');
  }

  return res.json();
}

export async function editMessage(
  token: string,
  messageId: string,
  text: string,
): Promise<Message> {
  const res = await fetch(`${API_URL}/messages/${messageId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) throw new Error('Failed to edit message');
  return res.json();
}

export async function deleteMessageForAll(
  token: string,
  messageId: string,
): Promise<Message> {
  const res = await fetch(`${API_URL}/messages/${messageId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Failed to delete message');
  return res.json();
}

export async function deleteMessageForMe(
  token: string,
  messageId: string,
): Promise<Message> {
  const res = await fetch(`${API_URL}/messages/${messageId}/me`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

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

  const res = await fetch(`${API_URL}/messages/pinned?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Failed to fetch pinned messages');
  return res.json();
}
