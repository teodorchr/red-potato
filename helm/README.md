# Red Potato Helm Chart

This Helm chart deploys the Red Potato Vehicle Inspection (ITP) Management System on Kubernetes.

## Prerequisites

- Kubernetes 1.23+
- Helm 3.8+
- PV provisioner support (for PostgreSQL persistence)
- Ingress controller (nginx-ingress recommended)

## Installation

### Quick Start

```bash
# Add the chart repository (if hosted)
# helm repo add red-potato https://charts.example.com

# Install with default values
helm install my-release ./helm/red-potato \
  --set postgresql.auth.password=your-secure-password \
  --set config.jwtSecret=your-jwt-secret
```

### Production Installation

1. Create a values file for your environment:

```yaml
# production-values.yaml
postgresql:
  auth:
    password: "your-secure-db-password"
  primary:
    persistence:
      size: 50Gi
      storageClass: "fast-ssd"

config:
  jwtSecret: "your-very-long-jwt-secret-at-least-64-chars"
  corsOrigin: "https://your-domain.com"

  seed:
    adminPassword: "secure-admin-password"
    operatorPassword: "secure-operator-password"

  twilio:
    enabled: true
    accountSid: "your-twilio-sid"
    authToken: "your-twilio-token"
    phoneNumber: "+1234567890"

  email:
    enabled: true
    host: "smtp.gmail.com"
    port: 587
    user: "your-email@gmail.com"
    password: "your-app-password"
    from: "Service Auto <noreply@serviceauto.ro>"

ingress:
  enabled: true
  className: "nginx"
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
  hosts:
    - host: your-domain.com
      paths:
        - path: /
          pathType: Prefix
          service: frontend
        - path: /api
          pathType: Prefix
          service: backend
  tls:
    - secretName: red-potato-tls
      hosts:
        - your-domain.com

backend:
  autoscaling:
    enabled: true
    minReplicas: 3
    maxReplicas: 10
```

2. Install with custom values:

```bash
helm install red-potato ./helm/red-potato \
  --namespace red-potato \
  --create-namespace \
  -f production-values.yaml
```

### Using External Database

To use an external PostgreSQL database instead of deploying one:

```yaml
postgresql:
  enabled: true
  external:
    enabled: true
    host: "your-db-host.example.com"
    port: 5432
    database: "red_potato"
    username: "postgres"
    existingSecret: "external-db-secret"
    secretKeys:
      passwordKey: "password"
```

### Using Existing Secrets

For enhanced security, you can use pre-existing Kubernetes secrets:

```yaml
postgresql:
  auth:
    existingSecret: "my-postgres-secret"
    secretKeys:
      passwordKey: "postgres-password"

config:
  twilio:
    enabled: true
    existingSecret: "my-twilio-secret"
    secretKeys:
      accountSidKey: "account-sid"
      authTokenKey: "auth-token"
      phoneNumberKey: "phone-number"

  email:
    enabled: true
    existingSecret: "my-email-secret"
    secretKeys:
      userKey: "username"
      passwordKey: "password"
```

## Configuration

### Global Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `global.imageRegistry` | Global Docker image registry | `""` |
| `global.imagePullSecrets` | Global image pull secrets | `[]` |

### Backend Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `backend.replicaCount` | Number of backend replicas | `2` |
| `backend.image.repository` | Backend image repository | `ghcr.io/teodorchr/red-potato-backend` |
| `backend.image.tag` | Backend image tag | `latest` |
| `backend.service.type` | Backend service type | `ClusterIP` |
| `backend.service.port` | Backend service port | `3000` |
| `backend.resources.limits.cpu` | CPU limit | `500m` |
| `backend.resources.limits.memory` | Memory limit | `512Mi` |
| `backend.autoscaling.enabled` | Enable HPA | `true` |
| `backend.autoscaling.minReplicas` | Minimum replicas | `2` |
| `backend.autoscaling.maxReplicas` | Maximum replicas | `10` |

### Frontend Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `frontend.replicaCount` | Number of frontend replicas | `2` |
| `frontend.image.repository` | Frontend image repository | `ghcr.io/teodorchr/red-potato-frontend` |
| `frontend.image.tag` | Frontend image tag | `latest` |
| `frontend.service.type` | Frontend service type | `ClusterIP` |
| `frontend.service.port` | Frontend service port | `80` |

### PostgreSQL Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `postgresql.enabled` | Deploy PostgreSQL | `true` |
| `postgresql.auth.database` | Database name | `red_potato` |
| `postgresql.auth.username` | Database username | `postgres` |
| `postgresql.auth.password` | Database password | `""` (required) |
| `postgresql.primary.persistence.enabled` | Enable persistence | `true` |
| `postgresql.primary.persistence.size` | PVC size | `10Gi` |
| `postgresql.external.enabled` | Use external database | `false` |

### Application Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `config.jwtSecret` | JWT secret key | `""` (auto-generated if empty) |
| `config.jwtExpiresIn` | JWT expiration time | `7d` |
| `config.cronEnabled` | Enable cron jobs | `true` |
| `config.cronTimezone` | Cron timezone | `Europe/Bucharest` |
| `config.itpReminderDays` | Days before ITP expiration to send reminder | `7` |
| `config.twilio.enabled` | Enable Twilio SMS | `false` |
| `config.email.enabled` | Enable email notifications | `false` |

### Ingress Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `ingress.enabled` | Enable ingress | `true` |
| `ingress.className` | Ingress class name | `nginx` |
| `ingress.hosts[0].host` | Hostname | `red-potato.local` |
| `ingress.tls` | TLS configuration | `[]` |

## Upgrading

```bash
helm upgrade red-potato ./helm/red-potato \
  --namespace red-potato \
  -f production-values.yaml
```

## Uninstalling

```bash
helm uninstall red-potato --namespace red-potato
```

**Note:** This will not delete PVCs. To completely remove all data:

```bash
kubectl delete pvc -l app.kubernetes.io/instance=red-potato --namespace red-potato
```

## Troubleshooting

### Check pod status
```bash
kubectl get pods -n red-potato -l app.kubernetes.io/instance=red-potato
```

### View backend logs
```bash
kubectl logs -f deploy/red-potato-backend -n red-potato
```

### Connect to database
```bash
kubectl exec -it red-potato-postgresql-0 -n red-potato -- psql -U postgres -d red_potato
```

### Run database migrations manually
```bash
kubectl exec -it deploy/red-potato-backend -n red-potato -- npx prisma migrate deploy
```

### Seed database
```bash
kubectl exec -it deploy/red-potato-backend -n red-potato -- npm run prisma:seed
```
