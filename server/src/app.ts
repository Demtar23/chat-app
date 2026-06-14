import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { errorMiddleware } from './middlewares/errorMiddleware';
import { authRouter } from './routes/authRouter';
import { userRouter } from './routes/userRouter';
import { messageRouter } from './routes/messageRouter';
import { roomRouter } from './routes/roomRouter';
import passport from './config/passport';

export const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());

app.use(cookieParser());
app.use((req, res, next) => {
  console.log('========== REQUEST ==========');
  console.log(req.method, req.originalUrl);
  console.log('Origin:', req.headers.origin);
  console.log('Cookie:', req.headers.cookie);
  next();
});

app.use(passport.initialize());

app.use('/api/auth', authRouter);

app.use('/api/user', userRouter);

app.use('/api/messages', messageRouter);

app.use('/api/rooms', roomRouter);

app.use(errorMiddleware);
