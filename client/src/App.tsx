import { useEffect } from 'react';

import { io } from 'socket.io-client';

function App() {
  useEffect(() => {
    const socket = io('http://localhost:5000', {
      withCredentials: true,

      auth: {
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZmM2NWZjNmY5ZDIwZWIxMmNiY2Y0YSIsInVzZXJuYW1lIjoidGVzdDEiLCJpYXQiOjE3NzgyMjUyMDcsImV4cCI6MTc3ODIyNTgwN30.vLrJDqO5snMC2Dz7ALVohSV_ZmawTfUwq1j4iKM9slc',
      },
    });

    socket.on('connect', () => {
      console.log('Connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold">Chat App</h1>
    </div>
  );
}

export default App;
