import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cron from 'node-cron';

import projectRoutes from './routes/projects';
import reputationRoutes from './routes/reputation';
import { EventIndexer } from './services/EventIndexer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/reputation', reputationRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stellar-freelance');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start event indexer
const eventIndexer = new EventIndexer();

// Schedule event indexing every 10 seconds
cron.schedule('*/10 * * * * *', () => {
  eventIndexer.indexEvents();
});

// Start server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
};

startServer().catch(console.error);