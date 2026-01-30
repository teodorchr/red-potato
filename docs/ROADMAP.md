# Red Potato - Development Roadmap

This document outlines planned features and improvements for the Red Potato Vehicle Inspection Management System.

## In Progress

### Testing
- [ ] Integration tests for API endpoints (requires test database setup)

## Planned

### Features
- [ ] Bulk import clients from CSV/Excel
- [ ] Export client data to CSV
- [ ] Advanced filtering and sorting on client list
- [ ] Notification scheduling customization per client
- [ ] WhatsApp notification integration
- [ ] Client portal for self-service ITP date updates

### Performance & Monitoring
- [ ] Application logging with structured JSON format
- [ ] Health check endpoints for Kubernetes probes
- [ ] Prometheus metrics endpoint
- [ ] Grafana dashboard templates

## Completed

- [x] Testing Infrastructure
  - [x] Jest setup for backend with ES modules support
  - [x] Vitest + React Testing Library for frontend
  - [x] Playwright for E2E tests
  - [x] Unit tests for backend utils and validators
  - [x] Unit tests for backend middlewares (auth, errorHandler)
  - [x] Unit tests for backend services (notification, email, sms)
  - [x] Frontend utility tests (formatters, validators)
  - [x] Frontend component tests (Button, Input)
  - [x] E2E test specs for auth, clients, and dashboard flows
- [x] CI/CD Pipeline
  - [x] GitHub Actions workflow for build (ci.yml)
    - [x] Lint and test backend
    - [x] Lint and test frontend
    - [x] Build Docker images
    - [x] Push images to GitHub Container Registry
  - [x] GitHub Actions workflow for deployment (deploy.yml)
    - [x] Deploy to staging environment on push to main
    - [x] Deploy to production on release tag
    - [x] Helm upgrade for Kubernetes deployments
    - [x] Rollback capability on failure
  - [x] Environment-specific Helm values (staging, production)
- [x] Kubernetes Deployment
  - [x] Helm chart for the application
  - [x] Backend deployment and service
  - [x] Frontend deployment and service
  - [x] PostgreSQL StatefulSet (with external DB support)
  - [x] ConfigMaps for environment configuration
  - [x] Secrets management for sensitive data
  - [x] Ingress configuration with TLS support
  - [x] Horizontal Pod Autoscaler (HPA) for backend
  - [x] Helm values and installation documentation
- [x] Internationalization (i18n)
  - [x] Language selector in UI header
  - [x] Support for Romanian (default), English, and French
  - [x] All UI labels, messages, and notifications translated
  - [x] Language preference persisted in localStorage
  - [x] Backend localized email/SMS templates
- [x] Core client management (CRUD operations)
- [x] JWT authentication with role-based access
- [x] Dashboard with statistics
- [x] ITP expiration reminder job
- [x] SMS notifications via Twilio
- [x] Email notifications via SMTP
- [x] Notification history tracking
- [x] Docker Compose deployment
- [x] Responsive UI with Tailwind CSS

---

*Last updated: January 2026*
