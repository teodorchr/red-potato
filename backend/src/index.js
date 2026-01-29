import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config/env.js';
import prisma from './config/database.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/clients.js';
import notificationRoutes from './routes/notifications.js';
import dashboardRoutes from './routes/dashboard.js';

// Import scheduler
import { initScheduler } from './jobs/scheduler.js';

const app = express();

// ==================== Middleware ====================

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit of 100 requests per IP
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// ==================== Routes ====================

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API info
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Red Potato API - ITP Management System',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      clients: '/api/clients',
      notifications: '/api/notifications',
      dashboard: '/api/dashboard',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ==================== Error Handling ====================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ==================== Server Start ====================

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log('\n' + '═'.repeat(60));
  console.log('🚀 RED POTATO API Server Started');
  console.log('═'.repeat(60));
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   Port: ${PORT}`);
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log('═'.repeat(60));
  console.log('📚 Available Endpoints:');
  console.log('   POST   /api/auth/login');
  console.log('   POST   /api/auth/register');
  console.log('   GET    /api/auth/me');
  console.log('   GET    /api/clients');
  console.log('   POST   /api/clients');
  console.log('   GET    /api/clients/expiring');
  console.log('   GET    /api/dashboard/stats');
  console.log('   GET    /api/notifications');
  console.log('   POST   /api/notifications/test');
  console.log('═'.repeat(60));

  // Initialize cronjobs
  if (config.cron.enabled) {
    console.log('\n🕐 Starting cronjobs...');
    const jobs = initScheduler();
    console.log('✅ Cronjobs initialized\n');

    // Save reference to be able to stop jobs on shutdown
    server.cronJobs = jobs;
  } else {
    console.log('\n⏸️  Cronjobs are disabled\n');
  }
});

// ==================== Graceful Shutdown ====================

const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️  ${signal} received. Starting graceful shutdown...`);

  // Stop server
  server.close(async () => {
    console.log('🛑 HTTP server closed');

    // Stop cronjobs
    if (server.cronJobs) {
      console.log('🛑 Stopping cronjobs...');
      const { stopScheduler } = await import('./jobs/scheduler.js');
      stopScheduler(server.cronJobs);
    }

    // Close database connection
    await prisma.$disconnect();
    console.log('🛑 Database connection closed');

    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Event handlers for shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Error handlers for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

export default app;
