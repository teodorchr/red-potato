import dotenv from 'dotenv';

dotenv.config();

const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-this',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // Twilio
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },

  // Email
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'Service Auto <noreply@serviceauto.ro>',
  },

  // SendGrid (optional)
  sendgridApiKey: process.env.SENDGRID_API_KEY,

  // Cronjob
  cron: {
    enabled: process.env.CRON_ENABLED !== 'false',
    timezone: process.env.CRON_TIMEZONE || 'Europe/Bucharest',
    itpReminderDays: parseInt(process.env.ITP_REMINDER_DAYS) || 7,
  },
};

// Validate critical configuration
if (!config.jwtSecret || config.jwtSecret === 'your-secret-key-change-this') {
  console.warn('⚠️  WARNING: Using default JWT secret. Please set JWT_SECRET in .env');
}

if (!config.databaseUrl) {
  console.error('❌ ERROR: DATABASE_URL is not set in .env');
  process.exit(1);
}

export default config;
