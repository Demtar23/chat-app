const API_URL = 'http://localhost:5000/api';

export type Message = {
  _id: string;
  text: string;
  senderId: string;
  senderUsername: string;
  type: 'global' | 'room' | 'private';
  roomId?: string;
  receiverId?: string;
  createdAt: string;
};

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