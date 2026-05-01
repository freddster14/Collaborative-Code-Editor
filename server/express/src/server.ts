import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import errorHandling from './middlewares/error-handling.js';
import index from './routes/index.js';
import redis from '../redis.ts';

const app = express();
app.use(cookieParser())
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));
await redis.connect();


const PORT = process.env.PORT || 3000;

app.use('/', index)
app.use(errorHandling)

redis.on('error', err => console.log('Redis Client Error', err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
