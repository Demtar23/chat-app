import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { errorMiddleware } from './middlewares/errorMiddleware';
import { authRouter } from './routes/authRouter';
import { userRouter } from './routes/userRouter';

export const app = express();

app.use(cors());

app.use(express.json());

app.use('/api', authRouter)

app.use('/api/user', userRouter);

app.use(errorMiddleware);