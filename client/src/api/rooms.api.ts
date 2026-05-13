const API_URL = 'http://localhost:5000/api';

export type Room = {
  _id: string;
  name: string;
  description: string;
  createdBy: string;
  members: string[];
  createdAt: string;
};

export async function fetchRooms(token: string): Promise<Room[]> {
  const res = await fetch(`${API_URL}/rooms`, {
    headers: { Authorization: `Bearer ${token}` },
  });

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
  const res = await fetch(`${API_URL}/rooms`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, description }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }

  return res.json();
}

export async function joinRoom(token: string, roomId: string): Promise<Room> {
  const res = await fetch(`${API_URL}/rooms/${roomId}/join`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }

  return res.json();
}

export async function leaveRoom(token: string, roomId: string): Promise<Room> {
  const res = await fetch(`${API_URL}/rooms/${roomId}/leave`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }

  return res.json();
}
