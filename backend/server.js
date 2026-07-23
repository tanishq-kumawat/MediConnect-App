import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import { connectDB } from './config/db.js';
import { setupSocketHandlers } from './sockets/socketHandler.js';
import { seedDatabase } from './seed/seedData.js';

import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import triageRoutes from './routes/triageRoutes.js';

import Doctor from './models/Doctor.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Attach io instance to req for controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/triage', triageRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Jaipur MediConnect API', time: new Date().toISOString() });
});

// Setup Socket.io Event Listeners
setupSocketHandlers(io);

const PORT = process.env.PORT || 5000;

// Connect DB & auto-seed if empty
connectDB().then(async () => {
  try {
    const doctorCount = await Doctor.countDocuments();
    if (doctorCount === 0) {
      console.log('Database empty on startup. Triggering auto-seed...');
      await seedDatabase();
    }
  } catch (err) {
    console.error('Error during auto-seed check:', err);
  }

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  });
});
