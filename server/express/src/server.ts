import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import errorHandling from './middlewares/error-handling.js';
import index from './routes/index.js';

const app = express();
app.use(cookieParser())
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.use('/', index)
app.use(errorHandling)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
