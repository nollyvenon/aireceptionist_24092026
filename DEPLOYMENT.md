# GLACIER AI Receptionist - Deployment Guide

## Overview

This guide covers deploying the GLACIER AI Receptionist application to production environments. The application uses Docker containerization, PostgreSQL, Redis, FastAPI backend, and Next.js frontend.

## Prerequisites

- Docker & Docker Compose
- PostgreSQL 16+
- Redis 7+
- Node.js 18+
- Python 3.11+
- Git

## Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/nollyvenon/aireceptionist_24092026.git
cd aireceptionist_24092026
```

### 2. Environment Configuration

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

### 3. Start Development Environment

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- Backend API on port 8000
- Frontend on port 3000

### 4. Initialize Database

```bash
docker-compose exec backend alembic upgrade head
```

### 5. Create Admin User

```bash
docker-compose exec backend python -c "
from database import SessionLocal
from app.services.user_service import UserService
from app.schemas.user import UserCreate
from uuid import uuid4

db = SessionLocal()
user_data = UserCreate(
    email='admin@glacierai.com',
    password='SecurePassword123!',
    first_name='Admin',
    last_name='User'
)
UserService.create_user(user_data, uuid4(), db)
db.close()
print('Admin user created')
"
```

## Testing

### Backend Tests

```bash
cd backend
pytest -v --cov=app --cov-report=html
```

### Frontend Tests

```bash
cd frontend
npm run test
```

## Production Deployment

### 1. Build Docker Images

```bash
docker build -t glacier-backend:latest ./backend
docker build -t glacier-frontend:latest ./frontend
```

### 2. Push to Registry

```bash
docker tag glacier-backend:latest your-registry/glacier-backend:latest
docker push your-registry/glacier-backend:latest

docker tag glacier-frontend:latest your-registry/glacier-frontend:latest
docker push your-registry/glacier-frontend:latest
```

### 3. Deploy to Server

#### Via SSH

```bash
ssh user@production-server
cd /app/glacier
git pull origin main
docker-compose pull
docker-compose up -d
docker-compose exec -T backend alembic upgrade head
```

#### Via GitHub Actions

GitHub Actions automatically deploys on push to main branch. Configure these secrets:

- `DOCKER_USERNAME`: Docker registry username
- `DOCKER_PASSWORD`: Docker registry password
- `DEPLOY_KEY`: SSH private key
- `DEPLOY_HOST`: Production server hostname
- `DEPLOY_USER`: Deploy user (usually `ubuntu` or `ec2-user`)

### 4. Environment Variables (Production)

Set on production server:

```bash
export SECRET_KEY=your_production_secret_key
export DATABASE_URL=postgresql://user:password@db-host:5432/glacier_ai
export REDIS_URL=redis://redis-host:6379/0
export OPENAI_API_KEY=sk-prod-key
export STRIPE_SECRET_KEY=sk_live_key
export TWILIO_ACCOUNT_SID=AC_prod_sid
export SENDGRID_API_KEY=SG_prod_key
```

## Database Migrations

### Create New Migration

```bash
docker-compose exec backend alembic revision --autogenerate -m "Add new feature"
```

### Run Migrations

```bash
docker-compose exec backend alembic upgrade head
```

### Rollback Migration

```bash
docker-compose exec backend alembic downgrade -1
```

## Monitoring

### Health Checks

```bash
curl http://localhost:8000/health
curl http://localhost:3000/api/health
```

### Logs

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Metrics

Configured via Datadog/Prometheus. Update docker-compose.yml with:

```yaml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
```

## Scaling

### Horizontal Scaling

1. Use load balancer (Nginx, HAProxy, AWS ALB)
2. Run multiple backend containers
3. Use RDS for PostgreSQL
4. Use ElastiCache for Redis

### Environment Variables for Scaling

```yaml
backend:
  deploy:
    replicas: 3
  environment:
    - DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/glacier
    - REDIS_URL=redis://elasticache-endpoint:6379
```

## SSL/TLS Configuration

### Self-Signed (Development)

```bash
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
```

### Let's Encrypt (Production)

```bash
docker-compose up -d certbot
docker-compose exec certbot certbot certonly --standalone -d glacierai.com
```

## Backup & Recovery

### Database Backup

```bash
docker-compose exec postgres pg_dump -U glacier_user glacier_ai > backup.sql
```

### Database Restore

```bash
docker-compose exec postgres psql -U glacier_user glacier_ai < backup.sql
```

### Redis Backup

```bash
docker-compose exec redis redis-cli BGSAVE
docker cp glacier_redis:/data/dump.rdb ./redis-backup.rdb
```

## Troubleshooting

### Container Won't Start

```bash
docker-compose logs backend
docker-compose exec backend python -m uvicorn main:app
```

### Database Connection Issues

```bash
docker-compose exec postgres psql -U glacier_user -d glacier_ai -c "SELECT 1;"
```

### Memory Issues

```bash
docker system df
docker system prune
docker volume prune
```

### Port Conflicts

```bash
lsof -i :8000
lsof -i :3000
lsof -i :5432
```

## Security Hardening

1. **Update Secrets**: Change all default values in .env
2. **Enable HTTPS**: Use SSL certificates
3. **Rate Limiting**: Configured in middleware (120 req/min default)
4. **CORS**: Whitelist known domains
5. **SQL Injection**: Using ORM (SQLAlchemy) prevents injection
6. **XSS Protection**: API returns JSON only
7. **CSRF**: Configured in FastAPI
8. **Password Hashing**: Using bcrypt with salt

## Performance Optimization

1. **Database Connection Pooling**: QueuePool with 20 connections
2. **Redis Caching**: Configured for sessions and frequently accessed data
3. **GZIP Compression**: Enabled for responses >1KB
4. **Image Optimization**: Next.js Image component
5. **Database Indexes**: On frequently queried fields
6. **Pagination**: All list endpoints support skip/limit

## Support & Contact

For issues or deployment help:
- GitHub Issues: https://github.com/nollyvenon/aireceptionist_24092026/issues
- Email: support@glacierai.com
