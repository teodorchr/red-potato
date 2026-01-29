# Red Potato - Vehicle Inspection Management System

A full-stack web application for managing ITP (Periodic Technical Inspection) notifications in auto service centers. The system enables client registration and automatic SMS/Email notifications for vehicles with ITP expiring in the next 7 days.

## Features

- **Client Management** - Full CRUD operations with soft delete support
- **ITP Tracking** - Monitor vehicle inspection expiration dates
- **Automated Notifications** - Daily scheduled job sends SMS and Email reminders
- **Dashboard** - Real-time statistics and upcoming expirations overview
- **Notification History** - Track all sent notifications with retry capability
- **Role-based Access** - Admin and Operator roles with JWT authentication
- **Responsive UI** - Mobile-friendly React interface

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL 15
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Scheduler**: node-cron

### Frontend
- **Framework**: React + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

### External Services
- **SMS**: Twilio
- **Email**: Nodemailer (SMTP/Gmail)

### DevOps
- Docker + Docker Compose
- Nginx (production frontend)

## Quick Start

### Method 1: Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/username/red-potato.git
cd red-potato

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start application
docker-compose up -d

# Access application
# Frontend: http://localhost
# Backend API: http://localhost:3000
```

### Method 2: Manual Setup

#### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Twilio account (for SMS)
- Email SMTP account

#### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npx prisma migrate dev
npx prisma db seed
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

### Demo Credentials
- **Admin**: `admin` / `admin123`
- **Operator**: `operator` / `operator123`

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/red_potato
DB_PASSWORD=your_password

# Authentication
JWT_SECRET=your_jwt_secret

# CORS
CORS_ORIGIN=http://localhost:5173

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=Service Auto <noreply@serviceauto.ro>

# Scheduler
CRON_ENABLED=true
CRON_TIMEZONE=Europe/Bucharest
ITP_REMINDER_DAYS=7
```

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/register` | Create user | Admin |
| GET | `/api/auth/me` | Current user info | Yes |
| POST | `/api/auth/logout` | Logout | Yes |

### Clients
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/clients` | List clients (paginated, searchable) | Yes |
| POST | `/api/clients` | Create client | Yes |
| GET | `/api/clients/:id` | Get client details | Yes |
| PUT | `/api/clients/:id` | Update client | Yes |
| DELETE | `/api/clients/:id` | Soft delete client | Yes |
| GET | `/api/clients/expiring` | Get clients with expiring ITP | Yes |

### Dashboard
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/dashboard/stats` | Dashboard statistics | Yes |

### Notifications
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/notifications` | Notification history | Yes |
| GET | `/api/notifications/stats` | Notification statistics | Yes |
| POST | `/api/notifications/test` | Send test notification | Yes |
| POST | `/api/notifications/:id/retry` | Retry failed notification | Yes |
| GET | `/api/notifications/client/:clientId` | Client notifications | Yes |

## Database Schema

### User
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| username | String | Unique username |
| email | String | Unique email |
| passwordHash | String | Bcrypt hashed password |
| role | Enum | 'admin' or 'operator' |
| lastLogin | DateTime | Last login timestamp |

### Client
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | Client name |
| licensePlate | String | Unique vehicle registration |
| phoneNumber | String | Contact phone |
| email | String | Contact email |
| itpExpirationDate | DateTime | ITP expiration date |
| active | Boolean | Soft delete flag |
| createdAt | DateTime | Record creation date |
| updatedAt | DateTime | Last update date |

### Notification
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| clientId | UUID | Foreign key to Client |
| type | String | 'SMS' or 'EMAIL' |
| status | String | 'pending', 'sent', 'failed' |
| message | String | Notification content |
| sentAt | DateTime | Send timestamp |
| error | String | Error message if failed |

## Scheduled Jobs

### ITP Reminder Job
- **Schedule**: Daily at 08:00 (configurable timezone)
- **Function**: Finds clients with ITP expiring within configured days
- **Actions**: Sends both SMS and Email notifications
- **Deduplication**: Skips clients already notified today

### Cleanup Job
- **Schedule**: First day of each month at 00:00
- **Function**: Deletes notifications older than 6 months

## Project Structure

```
red-potato/
├── docker-compose.yml
├── .env.example
├── README.md
├── docs/
│   └── DEPLOYMENT.md
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── index.js
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── env.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── clientController.js
│   │   │   ├── dashboardController.js
│   │   │   └── notificationController.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── clients.js
│   │   │   ├── dashboard.js
│   │   │   └── notifications.js
│   │   ├── services/
│   │   │   ├── smsService.js
│   │   │   ├── emailService.js
│   │   │   └── notificationService.js
│   │   ├── jobs/
│   │   │   ├── itp-reminder.js
│   │   │   └── scheduler.js
│   │   ├── middlewares/
│   │   │   ├── auth.js
│   │   │   ├── validation.js
│   │   │   └── errorHandler.js
│   │   └── utils/
│   │       ├── validators.js
│   │       └── helpers.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Clients.jsx
    │   │   ├── ClientForm.jsx
    │   │   └── Notifications.jsx
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   ├── Input.jsx
    │   │   └── Button.jsx
    │   ├── services/
    │   │   ├── api.js
    │   │   ├── authService.js
    │   │   ├── clientService.js
    │   │   ├── dashboardService.js
    │   │   └── notificationService.js
    │   ├── hooks/
    │   │   ├── useClients.js
    │   │   └── useDashboard.js
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── utils/
    │   │   ├── formatters.js
    │   │   └── validators.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

## Security

- **Authentication**: JWT tokens with 7-day expiration
- **Password Hashing**: bcrypt with salt
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **HTTP Headers**: Helmet.js security headers
- **CORS**: Configurable origin policy
- **Input Validation**: Zod schema validation on all endpoints
- **Soft Delete**: Client data preserved for audit trails

## Notification Templates

### SMS
```
Hello {name}! ITP for vehicle {licensePlate} expires in {days} days ({date}).
Please schedule an inspection at our service. Contact: 0722-XXX-XXX
```

### Email
HTML template with:
- Color-coded urgency (red for <3 days, orange for normal)
- Vehicle information
- Expiration date and days remaining
- Service contact information

## Development

### Running Tests
```bash
cd backend
npm test
```

### Database Migrations
```bash
cd backend
npx prisma migrate dev --name migration_name
```

### Seeding Demo Data
```bash
cd backend
npx prisma db seed
```

## Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions including:
- Docker Compose deployment
- Manual VPS deployment
- Cloud platform deployment (Railway, Render, Vercel)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details

## Support

- Issues: [GitHub Issues](https://github.com/username/red-potato/issues)
- Email: contact@serviceauto.ro
