import dotenv from 'dotenv';
import { app } from './app';
import { connectDB } from './config/db';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();

    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok' });
    });

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    })
  } catch (error) {
    console.error('Server failed to start:', error);
  }
}

start();
