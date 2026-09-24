# Deployment Guide - GLACIER AI Receptionist

## Overview

GLACIER AI is designed to be deployed on various platforms. This guide covers deployment to popular cloud providers.

## Prerequisites

- Docker and Docker Compose
- GitHub account with repository access
- Cloud provider account (AWS, GCP, or Azure)
- Domain name (for production)

## Local Development

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Deployment Environments

### Staging

Staging environment is automatically deployed on every push to `develop` branch.

```bash
# Trigger staging deployment
git push origin develop
```

Access staging at: `https://staging.glacierai.com`

### Production

Production deployment is triggered on every push to `main` branch.

```bash
# Trigger production deployment
git push origin main
```

Access production at: `https://glacierai.com`

## Cloud Provider Deployment

### AWS (Recommended)

#### Using ECS Fargate

1. **Create ECR Repository**
```bash
aws ecr create-repository --repository-name glacier-ai
```

2. **Build and Push Docker Image**
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <aws-account>.dkr.ecr.us-east-1.amazonaws.com

docker build -t glacier-ai .
docker tag glacier-ai:latest <aws-account>.dkr.ecr.us-east-1.amazonaws.com/glacier-ai:latest
docker push <aws-account>.dkr.ecr.us-east-1.amazonaws.com/glacier-ai:latest
```

3. **Create ECS Cluster**
```bash
aws ecs create-cluster --cluster-name glacier-ai-prod
```

4. **Deploy with CloudFormation or Terraform**

#### Using RDS

```bash
aws rds create-db-instance \
  --db-instance-identifier glacier-ai-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password <password> \
  --allocated-storage 20
```

#### Using ElastiCache

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id glacier-ai-redis \
  --engine redis \
  --cache-node-type cache.t3.micro \
  --engine-version 7.0
```

### Google Cloud Platform (GCP)

#### Using Cloud Run

```bash
# Build image
gcloud builds submit --tag gcr.io/<project-id>/glacier-ai

# Deploy to Cloud Run
gcloud run deploy glacier-ai \
  --image gcr.io/<project-id>/glacier-ai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Using Cloud SQL

```bash
gcloud sql instances create glacier-ai \
  --database-version POSTGRES_15 \
  --tier db-f1-micro
```

#### Using Cloud Redis

```bash
gcloud redis instances create glacier-ai-redis \
  --size=1 \
  --region=us-central1
```

### DigitalOcean

#### Using App Platform

1. Connect GitHub repository
2. Select branch to deploy
3. Configure environment variables
4. Deploy

```bash
# Using doctl CLI
doctl apps create --spec app.yaml
```

#### Using Managed Databases

```bash
# Create PostgreSQL cluster
doctl databases create \
  --engine pg \
  --num-nodes 1 \
  --region nyc1 \
  --size db-s-1vcpu-1gb \
  glacier-ai-db
```

## Environment Variables

Create `.env` file in production environment:

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=GLACIER AI Receptionist

# Database
DATABASE_URL=postgresql://user:password@host:5432/glacier_ai

# Redis
REDIS_URL=redis://redis-host:6379

# Authentication
NEXTAUTH_SECRET=<generate-random-secret>
JWT_SECRET=<generate-random-secret>

# External Services
STRIPE_SECRET_KEY=sk_live_xxx
TWILIO_ACCOUNT_SID=xxx
OPENAI_API_KEY=xxx

# AWS S3
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
AWS_S3_BUCKET=glacier-ai-prod
```

## Continuous Deployment

### GitHub Actions

Deployments are automatically triggered based on branch:

- **develop** → Staging
- **main** → Production

### Manual Deployment Trigger

```bash
# Trigger workflow from CLI
gh workflow run deploy.yml --ref main
```

## Database Migrations

### Running Migrations

```bash
# Local
npm run migrate

# Production
aws ecs exec \
  --cluster glacier-ai-prod \
  --task-id <task-id> \
  --container glacier-ai \
  npm run migrate
```

## Health Checks

### Frontend Health
```bash
curl https://glacierai.com/
```

### Backend Health
```bash
curl https://api.glacierai.com/health
```

### Database Health
```bash
psql $DATABASE_URL -c "SELECT 1;"
```

## Monitoring & Logging

### CloudWatch (AWS)
```bash
# View logs
aws logs tail /ecs/glacier-ai --follow

# Create alarms
aws cloudwatch put-metric-alarm \
  --alarm-name glacier-ai-cpu \
  --alarm-description "CPU utilization alarm" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80
```

### Stackdriver Logging (GCP)
```bash
# View logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50

# Create alert
gcloud alpha monitoring policies create --notification-channels=<channel-id>
```

## Scaling

### Horizontal Scaling (ECS)
```bash
aws ecs update-service \
  --cluster glacier-ai-prod \
  --service glacier-ai \
  --desired-count 5
```

### Auto Scaling (ECS)
```bash
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/glacier-ai-prod/glacier-ai \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10
```

## Backup & Disaster Recovery

### Database Backups
```bash
# AWS RDS automated backups (7 days default)
aws rds modify-db-instance \
  --db-instance-identifier glacier-ai-db \
  --backup-retention-period 30

# Manual backup
aws rds create-db-snapshot \
  --db-snapshot-identifier glacier-ai-backup-$(date +%s)
```

### Point-in-time Recovery
```bash
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier glacier-ai-db \
  --target-db-instance-identifier glacier-ai-db-restored \
  --restore-time 2024-01-01T00:00:00Z
```

## SSL/TLS Certificates

### Using AWS Certificate Manager
```bash
aws acm request-certificate \
  --domain-name glacierai.com \
  --validation-method DNS
```

### Using Let's Encrypt
```bash
certbot certonly --dns-route53 -d glacierai.com
```

## DNS Configuration

### Route 53 (AWS)
1. Create hosted zone for `glacierai.com`
2. Add A record pointing to CloudFront/Load Balancer
3. Update nameservers with domain registrar

## Troubleshooting

### Service won't start
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild containers
docker-compose build --no-cache
docker-compose up -d
```

### Database connection errors
```bash
# Check database is running
docker-compose ps postgres

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

### High CPU usage
```bash
# Check resource usage
docker stats

# Scale up services
docker-compose up -d --scale api=3
```

## Support

For deployment issues, contact: support@glacierai.com
