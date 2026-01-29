# Red Potato - Vehicle Inspection Management System

## Project Description

Responsive web application for managing ITP (Periodic Technical Inspection) notifications in an auto service. The system allows client registration and automatic sending of notifications via SMS and email for vehicles with ITP expiring in the next 7 days.

## System Architecture

### 1. Recommended Technology Stack

#### Frontend
- **Framework**: React.js or Next.js
- **UI Library**: Tailwind CSS + shadcn/ui or Material-UI
- **State Management**: React Context API or Redux Toolkit
- **Form Handling**: React Hook Form + Zod for validation
- **Responsive**: Mobile-first design, PWA capabilities

#### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js or Fastify
- **ORM**: Prisma or TypeORM
- **Validation**: Zod or Joi
- **Authentication**: JWT + bcrypt

#### Database
- **Option 1**: PostgreSQL (recommended for production)
- **Option 2**: MySQL/MariaDB
- **Option 3**: SQLite (for rapid development)

#### External Services
- **SMS**: Twilio, SMS.to, or ClickSend
- **Email**: SendGrid, AWS SES, Mailgun, or simple SMTP

#### Cronjob
- **Option 1**: node-cron (for standalone application)
- **Option 2**: Linux crontab + separate Node.js script
- **Option 3**: Bull/BullMQ with Redis for queue management

#### Deployment
- **Frontend**: Vercel, Netlify, or Cloudflare Pages
- **Backend**: Railway, Render, DigitalOcean, or VPS
- **Database**: Supabase, PlanetScale, or managed DB service

---

### 2. Database Structure

#### Table: `clients`
```sql
CREATE TABLE clients (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nume               VARCHAR(255) NOT NULL,
  numar_inmatriculare VARCHAR(20) NOT NULL UNIQUE,
  numar_telefon      VARCHAR(20) NOT NULL,
  email              VARCHAR(255) NOT NULL,
  data_expirare_itp  DATE NOT NULL,
  data_crearii       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_actualizarii  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activ              BOOLEAN DEFAULT true,
  INDEX idx_data_expirare (data_expirare_itp),
  INDEX idx_numar_inmatriculare (numar_inmatriculare)
);
```

#### Table: `notifications` (optional - for tracking)
```sql
CREATE TABLE notifications (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id          UUID REFERENCES clients(id) ON DELETE CASCADE,
  tip                VARCHAR(10) NOT NULL, -- 'SMS' sau 'EMAIL'
  status             VARCHAR(20) NOT NULL, -- 'pending', 'sent', 'failed'
  mesaj              TEXT,
  data_trimitere     TIMESTAMP,
  eroare             TEXT,
  INDEX idx_client_id (client_id),
  INDEX idx_status (status)
);
```

#### Table: `users` (for service operators)
```sql
CREATE TABLE users (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username           VARCHAR(100) NOT NULL UNIQUE,
  email              VARCHAR(255) NOT NULL UNIQUE,
  password_hash      VARCHAR(255) NOT NULL,
  rol                VARCHAR(20) DEFAULT 'operator', -- 'admin', 'operator'
  data_crearii       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultima_autentificare TIMESTAMP
);
```

---

### 3. API Endpoints

#### Authentication
```
POST   /api/auth/login          - Operator authentication
POST   /api/auth/logout         - Logout
GET    /api/auth/me             - Check current session
```

#### Clients
```
GET    /api/clients             - List all clients (with pagination, filtering, sorting)
GET    /api/clients/:id         - Client details
POST   /api/clients             - Create new client
PUT    /api/clients/:id         - Update client
DELETE /api/clients/:id         - Delete client (soft delete)
GET    /api/clients/expiring    - Clients with ITP expiring in the next N days
```

#### Notifications
```
GET    /api/notifications       - Notification history
POST   /api/notifications/test  - Test manual notification sending
GET    /api/notifications/stats - Notification statistics (sent, failed, etc.)
```

#### Dashboard
```
GET    /api/dashboard/stats     - General statistics (total clients, upcoming expirations, etc.)
```

---

### 4. Cronjob Logic

#### File: `src/jobs/itp-reminder.js`

```javascript
// Pseudocode for cronjob
async function checkAndNotifyExpiring() {
  const today = new Date();
  const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  // 1. Find all vehicles with ITP expiring in the next 7 days
  const expiringClients = await db.clients.findMany({
    where: {
      data_expirare_itp: {
        gte: today,
        lte: sevenDaysLater
      },
      activ: true
    }
  });

  // 2. For each client, check if they haven't already received a notification today
  for (const client of expiringClients) {
    const notificationSentToday = await db.notifications.findFirst({
      where: {
        client_id: client.id,
        data_trimitere: {
          gte: startOfDay(today)
        }
      }
    });

    if (notificationSentToday) continue;

    // 3. Calculate how many days remain until expiration
    const daysRemaining = Math.ceil(
      (new Date(client.data_expirare_itp) - today) / (1000 * 60 * 60 * 24)
    );

    // 4. Create the message
    const message = `Bună ziua ${client.nume}! ITP pentru mașina ${client.numar_inmatriculare} expiră în ${daysRemaining} zile (${client.data_expirare_itp}). Vă rugăm să programați o nouă inspecție la service-ul nostru.`;

    // 5. Send SMS
    try {
      await sendSMS(client.numar_telefon, message);
      await logNotification(client.id, 'SMS', 'sent', message);
    } catch (error) {
      await logNotification(client.id, 'SMS', 'failed', message, error.message);
    }

    // 6. Send Email
    try {
      await sendEmail(client.email, 'Reminder ITP', message);
      await logNotification(client.id, 'EMAIL', 'sent', message);
    } catch (error) {
      await logNotification(client.id, 'EMAIL', 'failed', message, error.message);
    }
  }
}
```

#### Cronjob Configuration

**Option 1: node-cron (in application)**
```javascript
// src/index.js
const cron = require('node-cron');

// Run daily at 08:00
cron.schedule('0 8 * * *', async () => {
  console.log('Running ITP reminder job...');
  await checkAndNotifyExpiring();
}, {
  timezone: "Europe/Bucharest"
});
```

**Option 2: Linux Crontab**
```bash
# Edit crontab
crontab -e

# Add line (run at 08:00 daily)
0 8 * * * cd /path/to/red-potato && node src/jobs/run-itp-reminder.js >> /var/log/itp-reminder.log 2>&1
```

---

### 5. Frontend Components

#### Main Pages

1. **Login Page** (`/login`)
   - Authentication form for operators

2. **Dashboard** (`/`)
   - General statistics
   - Upcoming expiration chart
   - Recent activity

3. **Clients** (`/clients`)
   - Table with all clients
   - Filtering and sorting
   - Buttons for add/edit/delete
   - Search by name, registration number

4. **Add/Edit Client** (`/clients/new`, `/clients/:id/edit`)
   - Form with validation:
     - Name (required, min 2 characters)
     - Registration number (required, valid RO format)
     - Phone number (required, valid format)
     - Email (required, valid format)
     - ITP expiration date (required, date picker)

5. **Notifications** (`/notifications`)
   - Sent notification history
   - Status (success/failure)
   - Manual resend capability

6. **Settings** (`/settings`)
   - SMS/Email provider configuration
   - Message templates
   - Warning days number (default: 7)

---

### 6. Security

#### Implemented Measures

1. **Authentication**: JWT tokens with refresh mechanism
2. **Input Validation**: Sanitize all inputs (prevent SQL injection, XSS)
3. **Rate Limiting**: Limit requests per IP (prevent brute force)
4. **HTTPS**: SSL certificate for secure communication
5. **CORS**: Strict CORS policy configuration
6. **Environment Variables**: API keys and credentials in `.env` (not in git)
7. **Password Hashing**: bcrypt with salt for passwords
8. **GDPR Compliance**:
   - Client consent for data storage
   - Right to delete personal data
   - Encryption of sensitive data in database

---

### 7. Project Structure

```
red-potato/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── env.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── clientController.js
│   │   │   └── notificationController.js
│   │   ├── middlewares/
│   │   │   ├── auth.js
│   │   │   ├── validation.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── Client.js
│   │   │   ├── Notification.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── clients.js
│   │   │   └── notifications.js
│   │   ├── services/
│   │   │   ├── smsService.js
│   │   │   ├── emailService.js
│   │   │   └── notificationService.js
│   │   ├── jobs/
│   │   │   ├── itp-reminder.js
│   │   │   └── scheduler.js
│   │   ├── utils/
│   │   │   ├── validators.js
│   │   │   └── helpers.js
│   │   └── index.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Layout.jsx
│   │   │   ├── clients/
│   │   │   │   ├── ClientList.jsx
│   │   │   │   ├── ClientForm.jsx
│   │   │   │   └── ClientCard.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── StatsCard.jsx
│   │   │   │   └── ExpiringChart.jsx
│   │   │   └── common/
│   │   │       ├── Button.jsx
│   │   │       ├── Input.jsx
│   │   │       └── Modal.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Clients.jsx
│   │   │   ├── ClientForm.jsx
│   │   │   ├── Notifications.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── clientService.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useClients.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── utils/
│   │   │   ├── validators.js
│   │   │   └── formatters.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── USER_GUIDE.md
│
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

### 8. Message Templates

#### SMS Template
```
Bună ziua {NUME}!
ITP pentru mașina {NUMAR_INMATRICULARE} expiră în {ZILE} zile ({DATA_EXPIRARE}).
Programați-vă la service: 0722-XXX-XXX
```

#### Email Template
```html
<h2>Reminder ITP</h2>
<p>Bună ziua {NUME},</p>
<p>Vă informăm că ITP pentru autovehiculul dumneavoastră cu numărul de înmatriculare <strong>{NUMAR_INMATRICULARE}</strong> va expira în <strong>{ZILE} zile</strong>, pe data de <strong>{DATA_EXPIRARE}</strong>.</p>
<p>Vă rugăm să vă programați cât mai curând pentru efectuarea unei noi inspecții tehnice periodice.</p>
<p>Contact service: 0722-XXX-XXX</p>
<p>Cu stimă,<br>Echipa Service Auto</p>
```

---

### 9. SMS/Email Integrations

#### SMS (Twilio - Example)
```javascript
// src/services/smsService.js
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendSMS(phoneNumber, message) {
  const result = await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber // format: +40722XXXXXX
  });

  return result;
}
```

#### Email (SendGrid - Example)
```javascript
// src/services/emailService.js
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(to, subject, html) {
  const msg = {
    to: to,
    from: process.env.EMAIL_FROM,
    subject: subject,
    html: html,
  };

  const result = await sgMail.send(msg);
  return result;
}
```

---

### 10. Deployment Workflow

#### Development
```bash
# Backend
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev

# Frontend
cd frontend
npm install
cp .env.example .env
npm run dev
```

#### Production (Docker)
```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: red_potato
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@db:5432/red_potato
      JWT_SECRET: ${JWT_SECRET}
      TWILIO_ACCOUNT_SID: ${TWILIO_ACCOUNT_SID}
      TWILIO_AUTH_TOKEN: ${TWILIO_AUTH_TOKEN}
    depends_on:
      - db
    ports:
      - "3000:3000"

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

### 11. Future Features (Nice to Have)

1. **Dashboard Analytics**
   - Charts with number of expired ITPs per month
   - Client return rates

2. **Online Appointments**
   - Calendar for ITP appointments
   - Automatic confirmation via SMS/Email

3. **Data Export**
   - Export clients to CSV/Excel
   - Monthly reports

4. **Multi-tenancy**
   - Support for multiple services
   - Custom branding

5. **Mobile App**
   - Native iOS/Android application with React Native

6. **Multiple Notifications**
   - First notification at 30 days
   - Second at 7 days
   - Third at 1 day

7. **ITP History**
   - Keeping all previous ITPs
   - Tracking interval between inspections

---

### 12. Legal and Compliance Considerations

1. **GDPR**: Explicit consent for personal data processing
2. **Opt-out**: Ability to unsubscribe from notifications
3. **Data Retention**: Data retention policy (e.g., 3 years after last ITP)
4. **Privacy**: Clear privacy policy
5. **Audit Trail**: Logs for CRUD operations on personal data

---

## Getting Started

### Method 1: Docker (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/username/red-potato.git
cd red-potato

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials (Twilio, Email, etc.)

# 3. Start application
docker-compose up -d

# 4. Initialize database
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run prisma:seed

# 5. Access application
# Frontend: http://localhost
# Backend API: http://localhost:3000
```

**Demo Credentials:**
- Admin: `admin` / `admin123`
- Operator: `operator` / `operator123`

### Method 2: Manual Setup

#### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Twilio account (for SMS)
- Email SMTP account (Gmail recommended)

#### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

---

## Complete Documentation

- [Backend README](backend/README.md) - API, Configuration, Troubleshooting
- [Deployment Guide](docs/DEPLOYMENT.md) - Docker, VPS, Cloud deployment

## Main Features

✅ **Client Management**
- Add, edit, delete clients
- Store ITP data (name, registration number, phone, email)
- Search and filtering

✅ **Automatic Notifications**
- Daily cronjob (08:00)
- Check for ITP expiring in the next 7 days
- Automatic SMS and Email sending
- Notification status tracking

✅ **Dashboard**
- General statistics
- Clients with expired ITP
- Upcoming expirations
- Notification activity

✅ **Security**
- JWT authentication
- Rate limiting
- Input validation
- HTTPS ready

## Technology Stack

**Backend:**
- Node.js + Express
- Prisma ORM + PostgreSQL
- JWT Authentication
- Twilio (SMS) + Nodemailer (Email)
- node-cron for jobs

**Frontend:**
- React + Vite
- Tailwind CSS
- React Router
- Axios
- React Hot Toast

**DevOps:**
- Docker + Docker Compose
- Nginx
- CI/CD ready

## Contributing

Contributions are welcome! For major changes:
1. Fork the repository
2. Create a branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For issues and questions:
- 📧 Email: contact@serviceauto.ro
- 🐛 Issues: [GitHub Issues](https://github.com/username/red-potato/issues)

## License

MIT License - see [LICENSE](LICENSE) for details

## Authors

- **Red Potato Team** - Initial development

---

Made with ❤️ for automotive service professionals
