# Deployment Guide - Red Potato

## Docker Deployment (Recommended)

### 1. Preparation

```bash
# Clone the repository
git clone https://github.com/username/red-potato.git
cd red-potato

# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### 2. .env Configuration

Edit the `.env` file and fill in the values:

```env
DB_PASSWORD=parola_sigura_postgres
JWT_SECRET=o_cheie_secreta_foarte_lunga_si_aleatoare
CORS_ORIGIN=http://your-domain.com
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

### 3. Start Application

```bash
# Build and start containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Database Initialization

```bash
# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Populate with demo data (optional)
docker-compose exec backend npm run prisma:seed
```

### 5. Access Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

### 6. Useful Commands

```bash
# Stop application
docker-compose down

# Restart application
docker-compose restart

# View backend logs
docker-compose logs -f backend

# View frontend logs
docker-compose logs -f frontend

# Complete cleanup (includes volumes)
docker-compose down -v
```

## Manual Deployment (without Docker)

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure .env
cp .env.example .env
nano .env

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npm run prisma:seed

# Start server
npm start
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure .env
cp .env.example .env
nano .env

# Build for production
npm run build

# Serve with nginx or static host
```

## VPS Deployment (DigitalOcean, Linode, etc.)

### 1. Server Preparation

```bash
# Connect to server
ssh user@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Relogin for docker group
exit
ssh user@your-server-ip
```

### 2. Deploy Application

```bash
# Clone repository
git clone https://github.com/username/red-potato.git
cd red-potato

# Configure .env
nano .env

# Start with Docker
docker-compose up -d

# Check status
docker-compose logs -f
```

### 3. Configure Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/red-potato
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activate site
sudo ln -s /etc/nginx/sites-available/red-potato /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### 4. Firewall Configuration

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Cloud Platform Deployment

### Railway.app

1. Connect GitHub repository
2. Add services: PostgreSQL, Backend, Frontend
3. Configure environment variables
4. Auto-deploy on every push

### Render.com

1. Create services:
   - PostgreSQL Database
   - Web Service (Backend)
   - Static Site (Frontend)
2. Connect repository
3. Configure build commands and environment variables
4. Deploy

### Vercel (Frontend) + Railway (Backend + DB)

**Backend + DB on Railway:**
- Deploy backend and PostgreSQL on Railway
- Note the backend URL

**Frontend on Vercel:**
```bash
cd frontend
npm install -g vercel
vercel
```

- Set `VITE_API_URL` with Railway backend URL

## Backup and Restore

### Backup Database

```bash
# With Docker
docker-compose exec db pg_dump -U postgres red_potato > backup_$(date +%Y%m%d).sql

# Manual
pg_dump -U postgres -h localhost red_potato > backup.sql
```

### Restore Database

```bash
# With Docker
docker-compose exec -T db psql -U postgres red_potato < backup.sql

# Manual
psql -U postgres -h localhost red_potato < backup.sql
```

## Monitoring and Logs

### Application Check

```bash
# Health check
curl http://localhost:3000/health

# Service status
docker-compose ps

# Resource usage
docker stats
```

### Logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

## Troubleshooting

### Backend doesn't start

```bash
# Check logs
docker-compose logs backend

# Check if database is accessible
docker-compose exec backend npx prisma db push
```

### Frontend doesn't connect to backend

- Check `CORS_ORIGIN` in backend `.env`
- Check `VITE_API_URL` in frontend `.env`
- Check if backend responds at `/health`

### Cronjob doesn't run

- Check `CRON_ENABLED=true` in `.env`
- Check timezone: `CRON_TIMEZONE=Europe/Bucharest`
- View logs for errors

## Security

1. **Change default passwords** from `.env.example`
2. **Use HTTPS** in production (Let's Encrypt)
3. **Regular backup** of the database
4. **Regular updates** of dependencies: `npm audit fix`
5. **Monitor** logs for suspicious activity
6. **Restrict access** to DB ports (5432) to local only
7. **Rate limiting** is enabled by default in API

## Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Run migrations if any
docker-compose exec backend npx prisma migrate deploy
```
