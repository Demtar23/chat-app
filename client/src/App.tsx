import { useEffect, useState } from 'react';

import { io } from 'socket.io-client';
import type { OnlineUser } from './types/socket';

const accessToken = prompt('Enter token') || '';

const socket = io('http://localhost:5000', {
  withCredentials: true,

  auth: {
    token: accessToken,
  },
});

function App() {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    socket.on('online_users', (users: OnlineUser[]) => {
      console.log(users);

      setOnlineUsers(users);
    });

    return () => {
      socket.off('online_users');
    };
  }, []);

  return (
    <div className="h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold">Chat App</h1>

      <div className="space-y-3">
        {onlineUsers.map((user) => (
          <div key={user.socketId} className="border rounded-x1">
            {user.userName}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
