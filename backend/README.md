# GLACIER AI Receptionist - Backend

FastAPI backend for GLACIER AI Receptionist SaaS platform.

## Overview

The backend is built with Python 3.11+ using FastAPI, providing a high-performance async API for appointment booking, customer management, payments, and AI integration.

## Architecture

### Layers

1. **API Routes** (`app/api/`): HTTP endpoint definitions
2. **Services** (`app/services/`): Business logic layer
3. **Models** (`app/models/`): SQLAlchemy ORM models
4. **Schemas** (`app/schemas/`): Pydantic request/response validation
5. **Database** (`database.py`): Connection pooling and session management

### Database Models

- **User**: System users (admin/staff/customer)
- **Organization**: Multi-tenant isolation
- **Customer**: Leads and customers with lead scoring
- **Appointment**: Booking with conflict detection
- **Payment**: Stripe integration with refunds
- **Activity**: Customer interaction logging
- **Automation**: Workflow triggers and actions
- **Settings**: Organization configuration

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Environment Variables

```bash
export DATABASE_URL=postgresql://user:password@localhost:5432/glacier_ai
export REDIS_URL=redis://localhost:6379/0
export SECRET_KEY=your_secret_key
export OPENAI_API_KEY=sk-your-key
```

### 3. Run Development Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Access API

- Interactive Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

## API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - Register user
- `POST /login` - Login user
- `POST /refresh` - Refresh access token
- `GET /me` - Current user info
- `POST /verify-email` - Verify email

### Customers (`/api/v1/customers`)
- `POST /` - Create customer
- `GET /` - List customers (paginated)
- `GET /{id}` - Get customer
- `PUT /{id}` - Update customer
- `GET /search` - Search customers
- `GET /{id}/lead-score` - Get lead score (0-100)

### Appointments (`/api/v1/appointments`)
- `POST /` - Create appointment
- `GET /` - List appointments (paginated, filterable)
- `GET /{id}` - Get appointment
- `PUT /{id}` - Update appointment
- `POST /{id}/cancel` - Cancel appointment
- `POST /{id}/confirm` - Confirm appointment
- `GET /availability/{staff_id}` - Get available slots

### Payments (`/api/v1/payments`)
- `POST /` - Create payment intent
- `GET /` - List payments
- `GET /{id}` - Get payment
- `POST /{id}/confirm` - Confirm payment (webhook)
- `POST /{id}/refund` - Refund payment

### AI Routes (`/api/v1/ai`)
- `POST /message` - Process customer message
- `GET /availability` - Get available slots
- `POST /voice/initiate` - Initiate voice call
- `POST /chat/start` - Start chat session
- `GET /health` - AI service health

### Analytics (`/api/v1/analytics`)
- `GET /dashboard/summary` - Dashboard metrics
- `GET /appointments/by-status` - Appointment stats
- `GET /customers/by-status` - Customer stats
- `GET /revenue/daily` - Revenue tracking
- `GET /top-customers` - Top customers
- `GET /activity/by-type` - Activity metrics

### Automations (`/api/v1/automations`)
- `POST /` - Create automation
- `GET /` - List automations
- `GET /{id}` - Get automation
- `PUT /{id}` - Update automation
- `DELETE /{id}` - Delete automation
- `POST /{id}/toggle` - Toggle active status

## Services

### AuthService
- Password hashing with bcrypt
- JWT token creation and verification
- User authentication
- Organization access verification

### UserService
- User CRUD operations
- Email uniqueness validation
- User deactivation (soft delete)
- Organizational user listing

### CustomerService
- Customer CRUD operations
- Lead scoring algorithm
- Search functionality
- Pagination support

### AppointmentService
- Conflict detection (time overlap checking)
- Available slot generation
- Status management
- Cancellation handling

### PaymentService
- Stripe integration
- Payment intent creation
- Webhook handling
- Refund processing

### AIService
- OpenAI/Anthropic integration
- Booking intent detection
- Conversation history management
- System prompt generation

### EmailService & SMSService
- SendGrid email integration
- Twilio SMS integration
- Appointment reminders
- Receipt sending

## Middleware

1. **CORS**: Cross-origin request handling
2. **Error Handler**: Global exception handling
3. **Rate Limiter**: 120 req/min per IP
4. **Logger**: Request/response logging
5. **GZIP**: Response compression

## Testing

### Run All Tests

```bash
pytest -v --cov=app --cov-report=html
```

### Run Specific Test

```bash
pytest tests/test_auth.py::test_login -v
```

### Test Coverage

```bash
pytest --cov=app --cov-report=term-missing
```

## Database Migrations

### Create Migration

```bash
alembic revision --autogenerate -m "Add new feature"
```

### Apply Migrations

```bash
alembic upgrade head
```

### Rollback

```bash
alembic downgrade -1
```

## Performance Optimization

1. **Connection Pooling**: QueuePool with 20 connections
2. **Indexes**: On frequently queried fields
3. **Pagination**: All list endpoints support skip/limit
4. **Caching**: Redis for sessions and frequently accessed data
5. **Async/Await**: All endpoints are async

## Security

- **Password Security**: Bcrypt hashing with salt
- **SQL Injection**: ORM prevents injection
- **XSS**: API returns JSON only
- **CSRF**: Configured in FastAPI
- **Rate Limiting**: 120 requests/minute per IP
- **HTTPS**: Use in production

## Error Handling

All endpoints return consistent error format:

```json
{
  "detail": "Error message",
  "timestamp": "2024-01-01T00:00:00"
}
```

## Logging

Logs are output to stdout and can be configured via `LOG_LEVEL` environment variable.

```python
import logging
logger = logging.getLogger(__name__)
logger.info("Message")
```

## Background Tasks

Background task scheduler (`app/tasks/scheduler.py`) handles:
- Appointment reminders (1 hour before)
- Automation execution
- Token cleanup
- Daily reports

## Deployment

### Docker Build

```bash
docker build -t glacier-backend:latest .
```

### Run Container

```bash
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  glacier-backend:latest
```

### Production Checklist

- [ ] Set `SECRET_KEY` to random 32+ char string
- [ ] Enable HTTPS
- [ ] Configure database with proper credentials
- [ ] Set up Redis for caching
- [ ] Configure Stripe, Twilio, SendGrid, OpenAI keys
- [ ] Enable CORS only for known domains
- [ ] Set up monitoring/logging
- [ ] Run database migrations
- [ ] Create admin user
- [ ] Test health endpoint
- [ ] Configure backups

## Contributing

1. Create feature branch
2. Make changes
3. Write tests
4. Run linting: `black . && flake8 . && isort .`
5. Ensure tests pass: `pytest`
6. Submit PR

## Support

For issues or questions:
- GitHub Issues: https://github.com/nollyvenon/aireceptionist_24092026/issues
- Email: support@glacierai.com
