import type { Message } from "../types/message";

const API_URL = 'http://localhost:5000/api';


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
