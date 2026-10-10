import dotenv from 'dotenv';

// Load environment variables before importing app/db
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  // Connect to Database
  await connectDB();

  // Start HTTP Listener
  app.listen(PORT, () => {
    console.log(`[Hokhma Server] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`[Hokhma Server] Health check available at http://localhost:${PORT}/api/health`);
  });
};

startServer();
