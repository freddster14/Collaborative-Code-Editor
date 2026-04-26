import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
app.use(cookieParser())
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.use(errorHandling)
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
