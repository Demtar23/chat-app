import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { app } from './app';
import { connectDB } from './config/db';
import { initSocket } from './socket/socket';
import { setIo } from './socket/socketInstance';

dotenv.config();

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

setIo(io);
initSocket(io);

async function start() {
  try {
    await connectDB();

    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok' });
    });

    httpServer.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server failed to start:', error);
  }
}

start();
