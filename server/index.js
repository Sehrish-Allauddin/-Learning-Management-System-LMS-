const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();


const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const courseRoutes = require('./routes/courses');
const recommendationRoutes = require('./routes/recommendations');
const moduleRoutes = require('./routes/modules');
const assessmentRoutes = require('./routes/assessments');
const discussionRoutes = require('./routes/discussions');
const chatbotRoutes = require('./routes/chatbot');
const learningPathRoutes = require('./routes/learning-paths');
const leaderboardRoutes = require('./routes/leaderboard');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');
const startReminderJob = require('./cron/reminders');
const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST']
  }
});

// Attach io to req so routes can emit events
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket mapping
const userSockets = new Map();
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSockets.set(Number(userId), socket.id);
  }
  
  socket.on('disconnect', () => {
    if (userId) {
      userSockets.delete(Number(userId));
    }
  });
});
// Attach userSockets to req to know active users
app.use((req, res, next) => {
  req.userSockets = userSockets;
  next();
});

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/discussions', discussionRoutes);
// app.use('/api/chatbot', chatbotRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/learning-paths', learningPathRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start background jobs
startReminderJob();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
