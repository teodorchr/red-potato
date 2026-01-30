# Red Potato - Development Roadmap

This document outlines planned features and improvements for the Red Potato Vehicle Inspection Management System.

## In Progress

### CI/CD Pipeline
- [ ] GitHub Actions workflow for build
  - [ ] Lint and test backend
  - [ ] Lint and test frontend
  - [ ] Build Docker images
  - [ ] Push images to container registry (GitHub Container Registry)
- [ ] GitHub Actions workflow for deployment
  - [ ] Deploy to staging environment on PR merge
  - [ ] Deploy to production on release tag
  - [ ] Helm upgrade for Kubernetes deployments
  - [ ] Rollback capability on failure

## Planned

### Testing
- [ ] Unit tests for backend controllers and services
- [ ] Integration tests for API endpoints
- [ ] Frontend component tests with React Testing Library
- [ ] End-to-end tests with Playwright or Cypress

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
