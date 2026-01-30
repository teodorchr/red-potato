# Red Potato - Development Roadmap

This document outlines planned features and improvements for the Red Potato Vehicle Inspection Management System.

## In Progress

### Internationalization (i18n)
- [ ] Add language selector button in the UI header
- [ ] Support for Romanian (default), English, and French
- [ ] Translate all UI labels, messages, and notifications
- [ ] Persist language preference in localStorage
- [ ] Backend support for localized email/SMS templates

### Kubernetes Deployment
- [ ] Create Helm chart for the application
  - [ ] Backend deployment and service
  - [ ] Frontend deployment and service
  - [ ] PostgreSQL StatefulSet (or external DB config)
  - [ ] ConfigMaps for environment configuration
  - [ ] Secrets management for sensitive data
  - [ ] Ingress configuration with TLS support
  - [ ] Horizontal Pod Autoscaler (HPA) for backend
- [ ] Document Helm values and installation instructions

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
