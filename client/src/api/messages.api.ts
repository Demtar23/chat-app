const API_URL = 'http://localhost:5000';

export async function fetchMessages(token: string) {
  const res = await fetch(`${API_URL}/api/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}