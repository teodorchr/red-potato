# Red Potato Backend

Backend API for the ITP auto service management system.

## Installation

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials

# Initialize database
npx prisma generate
npx prisma migrate dev --name init

# Populate database with demo data (optional)
npm run prisma:seed
```

## Starting Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## Useful Commands

```bash
# Prisma Studio - visual interface for the database
npm run prisma:studio

# Regenerate Prisma Client
npm run prisma:generate

# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy
```

## Notifications Configuration

### SMS (Twilio)
1. Create account on [Twilio](https://www.twilio.com/)
2. Obtain Account SID, Auth Token and Phone Number
3. Add credentials in `.env`:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### Email (SMTP)
For Gmail:
1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Add in `.env`:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```

## API Structure

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (admin only)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Clients
- `GET /api/clients` - List clients (with pagination, filtering)
- `GET /api/clients/:id` - Client details
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client
- `GET /api/clients/expiring` - Clients with ITP expiring soon

### Notifications
- `GET /api/notifications` - List notifications
- `POST /api/notifications/test` - Send test notification
- `GET /api/notifications/stats` - Notification statistics
- `GET /api/notifications/client/:clientId` - Client notifications
- `POST /api/notifications/:id/retry` - Resend notification

### Dashboard
- `GET /api/dashboard/stats` - General statistics

## Cronjobs

### ITP Reminder
- **Schedule**: Daily at 08:00
- **Function**: Checks clients with ITP expiring in the next 7 days and sends notifications
- **Configuration**: Modify `ITP_REMINDER_DAYS` in `.env`

### Cleanup
- **Schedule**: First day of each month at 00:00
- **Function**: Deletes notifications older than 6 months

## User Setup

Before running `npm run prisma:seed`, configure your passwords in `.env`:

```env
SEED_ADMIN_PASSWORD=your_secure_admin_password
SEED_OPERATOR_PASSWORD=your_secure_operator_password
```

After seeding, two users will be created:
- **Admin**: Username `admin` or Email `admin@serviceauto.ro`
- **Operator**: Username `operator` or Email `operator@serviceauto.ro`

## API Testing

Using curl:

```bash
# Login (replace YOUR_PASSWORD with your actual password)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YOUR_PASSWORD"}'

# Get client list (with token)
curl http://localhost:3000/api/clients \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create new client
curl -X POST http://localhost:3000/api/clients \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nume": "Test User",
    "numarInmatriculare": "B-999-TST",
    "numarTelefon": "+40722999999",
    "email": "test@example.com",
    "dataExpirareItp": "2026-03-01"
  }'
```

Using the test script:
```bash
TEST_USERNAME=admin TEST_PASSWORD=your_password node test_api.js
```

## Environment Variables

Consult `.env.example` for the complete list of required environment variables.

## Troubleshooting

### Error "DATABASE_URL not set"
- Check if you have copied `.env.example` to `.env`
- Make sure `DATABASE_URL` is set correctly

### Notifications are not being sent
- Check Twilio/Email configuration in `.env`
- Check logs for specific errors
- Test manually with `POST /api/notifications/test`

### Cronjob is not running
- Check that `CRON_ENABLED=true` in `.env`
- Check timezone in configuration
- Run manually: import and execute `runItpReminderManually()` from `scheduler.js`
