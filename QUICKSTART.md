# GLACIER AI Receptionist - Quick Start Guide

Get GLACIER AI Receptionist up and running in 5 minutes.

## 🚀 One-Command Setup

```bash
# Clone and start
git clone https://github.com/nollyvenon/aireceptionist_24092026.git
cd aireceptionist_24092026
cp .env.example .env.local
docker-compose up -d

# Wait 30 seconds for services to start
sleep 30

# Initialize database
docker-compose exec backend alembic upgrade head
```

That's it! Services are now running:

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Web application |
| Backend API | http://localhost:8000 | API server |
| API Docs | http://localhost:8000/docs | Interactive API documentation |
| Database | localhost:5432 | PostgreSQL |
| Cache | localhost:6379 | Redis |

## 📋 First Time Setup

### 1. Create Admin User

```bash
docker-compose exec backend python << 'EOF'
from database import SessionLocal
from app.services.user_service import UserService
from app.schemas.user import UserCreate
from uuid import uuid4

db = SessionLocal()
org_id = uuid4()

user_data = UserCreate(
    email="admin@glacierai.com",
    password="Admin@123456",
    first_name="Admin",
    last_name="User"
)

user = UserService.create_user(user_data, org_id, db)
print(f"✓ Admin user created: admin@glacierai.com")
print(f"✓ Organization ID: {org_id}")
print(f"✓ Password: Admin@123456")
EOF
```

### 2. Login & Test API

```bash
# Login to get access token
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@glacierai.com", "password": "Admin@123456"}'

# Response:
# {
#   "access_token": "eyJ0eXAi...",
#   "refresh_token": "eyJ0eXAi...",
#   "token_type": "bearer",
#   "expires_in": 1800
# }
```

### 3. Create Test Customer

```bash
TOKEN="eyJ0eXAi..."  # From login response above

curl -X POST "http://localhost:8000/api/v1/customers?token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "company_name": "Acme Corp",
    "job_title": "CEO",
    "source": "website"
  }'
```

### 4. Create Appointment

```bash
CUSTOMER_ID="uuid-from-customer-response"

curl -X POST "http://localhost:8000/api/v1/appointments?token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"customer_id\": \"$CUSTOMER_ID\",
    \"title\": \"Consultation\",
    \"description\": \"Initial consultation\",
    \"start_time\": \"2026-09-25T10:00:00\",
    \"end_time\": \"2026-09-25T11:00:00\",
    \"duration_minutes\": 60,
    \"appointment_type\": \"consultation\",
    \"location\": \"Conference Room A\"
  }"
```

## 🔌 Connect External Services

### Stripe (Payments)

1. Get API keys from https://dashboard.stripe.com
2. Update `.env.local`:
```
STRIPE_PUBLIC_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
```
3. Restart backend: `docker-compose restart backend`

### Twilio (SMS)

1. Get credentials from https://console.twilio.com
2. Update `.env.local`:
```
TWILIO_ACCOUNT_SID=AC_your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

### OpenAI (AI Receptionist)

1. Get API key from https://platform.openai.com
2. Update `.env.local`:
```
OPENAI_API_KEY=sk-your-key
```

### SendGrid (Email)

1. Get API key from https://sendgrid.com
2. Update `.env.local`:
```
SENDGRID_API_KEY=SG_your_key
SENDGRID_FROM_EMAIL=noreply@example.com
```

## 🧪 Run Tests

```bash
# Backend tests
docker-compose exec backend pytest -v

# Frontend tests (from project root)
npm test

# With coverage
docker-compose exec backend pytest --cov=app --cov-report=html
```

## 📊 View Logs

```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# Database logs
docker-compose logs -f postgres

# All services
docker-compose logs -f
```

## 🛠️ Common Commands

### Stop Services

```bash
docker-compose down
```

### Restart Services

```bash
docker-compose restart backend
```

### Fresh Database

```bash
docker-compose down -v  # Remove volumes
docker-compose up -d
docker-compose exec backend alembic upgrade head
```

### Database Shell

```bash
docker-compose exec postgres psql -U glacier_user -d glacier_ai
```

### Redis Shell

```bash
docker-compose exec redis redis-cli
```

### Backend Shell

```bash
docker-compose exec backend bash
```

## 🐛 Troubleshooting

### Services won't start

```bash
# Check logs
docker-compose logs

# Rebuild containers
docker-compose build --no-cache
docker-compose up -d
```

### Database connection error

```bash
# Wait for database to be ready
docker-compose exec postgres pg_isready -U glacier_user

# Check connection
psql postgresql://glacier_user:glacier_password@localhost:5432/glacier_ai
```

### Port conflicts

```bash
# Check which process is using port
lsof -i :8000
lsof -i :3000
lsof -i :5432

# Kill process
kill -9 <PID>
```

### Redis connection error

```bash
# Check Redis
docker-compose exec redis redis-cli ping
# Should return: PONG
```

## 📚 Next Steps

1. **Explore API**: Visit http://localhost:8000/docs
2. **Read Documentation**: See [API.md](./API.md)
3. **Deployment**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
4. **Backend Guide**: See [backend/README.md](./backend/README.md)
5. **Configure Features**: Set up Stripe, Twilio, OpenAI in `.env.local`

## 💡 Tips

- **API Documentation**: Interactive docs at `/docs` or `/redoc`
- **Testing Endpoints**: Use `/docs` interface to test API
- **Development Mode**: Hot-reload enabled for both frontend and backend
- **Database Migrations**: Run with `alembic upgrade head`
- **Rate Limiting**: 120 requests per minute per IP

## 🆘 Getting Help

- **Docs**: https://docs.glacierai.com
- **API Docs**: http://localhost:8000/docs
- **Issues**: https://github.com/nollyvenon/aireceptionist_24092026/issues
- **Email**: support@glacierai.com

## 🎉 You're Ready!

Your GLACIER AI Receptionist instance is now running. Start exploring and building!

Next: Create more customers, set up automations, and configure AI responses in the settings.
