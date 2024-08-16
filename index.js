import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './database/db.config.js';
import userRouter from './routers/User.router.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the Server 🌐' });
});

app.use('/api/user', userRouter);

connectDB();

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});