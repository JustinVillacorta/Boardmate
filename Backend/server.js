import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import CronJobs from './utils/cronJobs.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  const start = Date.now();
  console.log(`📥 ${req.method} ${req.originalUrl} - ${req.ip}`);

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '🔴' : res.statusCode >= 300 ? '🟡' : '🟢';
    console.log(`📤 ${statusColor} ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });

  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/announcements', announcementRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Boardmate API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  await connectDB();
  CronJobs.startJobs();
  
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();

process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  CronJobs.stopJobs();
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  CronJobs.stopJobs();
  await mongoose.connection.close();
  process.exit(0);
});

export default app;