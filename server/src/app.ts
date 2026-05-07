import express from 'express';
import cors from 'cors';
import { errorMiddleware } from './middlewares/errorMiddleware';
import { authRouter } from './routes/authRouter';

export const app = express();

app.use(cors());

app.use(express.json());

app.use('/api', authRouter)

app.use(errorMiddleware);