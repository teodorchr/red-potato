# Red Potato Frontend

Red Potato application frontend - responsive web interface for ITP notification management.

## Technology Stack

- **React 18** - UI Library
- **Vite** - Build tool and dev server
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **date-fns** - Date manipulation
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## Installation

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Edit .env with backend URL
# VITE_API_URL=http://localhost:3000/api
```

## Development

```bash
# Start dev server
npm run dev

# Access the application
# http://localhost:5173
```

## Production Build

```bash
# Create optimized build
npm run build

# Preview local build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── common/        # Reusable components (Button, Input)
│   └── layout/        # Layout and navigation
├── pages/             # Application pages
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Clients.jsx
│   ├── ClientForm.jsx
│   └── Notifications.jsx
├── services/          # API clients
│   ├── api.js
│   ├── authService.js
│   ├── clientService.js
│   └── notificationService.js
├── hooks/             # Custom React hooks
│   ├── useClients.js
│   └── useDashboard.js
├── context/           # React Context
│   └── AuthContext.jsx
├── utils/             # Utilities
│   ├── formatters.js
│   └── validators.js
├── styles/            # Global CSS
│   └── index.css
├── App.jsx            # Root component
└── main.jsx           # Entry point
```

## Features

### Authentication
- JWT login
- Route protection
- Session management
- Auto-logout on token expiration

### Dashboard
- General statistics
- Clients with expired ITP
- Upcoming expirations
- Recent activity

### Client Management
- Full CRUD
- Search and filtering
- Pagination
- Form validation

### Notifications
- Notification history
- Filters (type, status)
- Statistics
- Manual resend

## Configuration

### Environment Variables

```env
VITE_API_URL=http://localhost:3000/api
```

### Development Proxy

In `vite.config.js` an API proxy is configured:

```javascript
server: {
  proxy: {
    '/api': 'http://localhost:3000'
  }
}
```

## Deployment

### Docker

The included Dockerfile creates an optimized build and serves it with Nginx.

```bash
docker build -t red-potato-frontend .
docker run -p 80:80 red-potato-frontend
```

### Vercel/Netlify

```bash
# Set VITE_API_URL in environment variables
# Automatic deployment from Git
```

### Manual Build

```bash
npm run build
# Files from dist/ can be served with any web server
```

## Customization

### Colors (Tailwind)

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your color here
      }
    }
  }
}
```

### Global Styles

Edit `src/styles/index.css` for custom components.

## Troubleshooting

### CORS Error
- Check `VITE_API_URL` in `.env`
- Check `CORS_ORIGIN` in backend `.env`

### API not responding
- Check if backend is running
- Check URL in `.env`

### Build fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Demo Credentials

After database seeding:
- **Admin**: `admin` / `admin123`
- **Operator**: `operator` / `operator123`
