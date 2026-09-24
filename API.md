# GLACIER AI Receptionist API Documentation

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

All endpoints require an access token in the query parameter:

```
?token=your_access_token
```

## Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource created
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Endpoints

### Authentication

#### POST /auth/register

Register a new user.

**Parameters:**
```
email: string
password: string (min 8 chars)
first_name: string
last_name: string
organization_id: UUID
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "admin",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00"
}
```

#### POST /auth/login

Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

#### POST /auth/refresh

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### GET /auth/me

Get current user information.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "role": "admin",
  "is_active": true,
  "is_email_verified": true
}
```

### Customers

#### POST /customers

Create a new customer.

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "company_name": "Tech Corp",
  "job_title": "CTO",
  "source": "website"
}
```

#### GET /customers

List all customers with pagination.

**Query Parameters:**
- `skip`: int (default 0)
- `limit`: int (default 50, max 100)
- `status`: string (optional - lead/prospect/customer/inactive)

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane@example.com",
      "status": "prospect",
      "lifetime_value_cents": 50000,
      "total_appointments": 5
    }
  ],
  "total": 150,
  "skip": 0,
  "limit": 50
}
```

#### GET /customers/{customer_id}

Get customer details.

#### PUT /customers/{customer_id}

Update customer.

**Request Body:**
```json
{
  "first_name": "Jane",
  "status": "customer",
  "tags": ["vip", "recurring"]
}
```

#### GET /customers/search

Search customers by name or email.

**Query Parameters:**
- `q`: string (min 1 char)
- `skip`: int (default 0)
- `limit`: int (default 50)

#### GET /customers/{customer_id}/lead-score

Get customer lead score (0-100).

**Response:**
```json
{
  "customer_id": "uuid",
  "lead_score": 75
}
```

### Appointments

#### POST /appointments

Create appointment.

**Request Body:**
```json
{
  "customer_id": "uuid",
  "title": "Consultation",
  "description": "Annual review",
  "start_time": "2024-02-01T10:00:00",
  "end_time": "2024-02-01T11:00:00",
  "duration_minutes": 60,
  "appointment_type": "consultation",
  "location": "Conference Room A",
  "meeting_url": "https://zoom.us/...",
  "notes": "Prepare quarterly report"
}
```

#### GET /appointments

List appointments with filtering.

**Query Parameters:**
- `skip`: int (default 0)
- `limit`: int (default 50)
- `status`: string (optional)
- `customer_id`: UUID (optional)

#### GET /appointments/{appointment_id}

Get appointment details.

#### PUT /appointments/{appointment_id}

Update appointment.

#### POST /appointments/{appointment_id}/cancel

Cancel appointment.

**Query Parameters:**
- `cancellation_reason`: string

#### POST /appointments/{appointment_id}/confirm

Confirm appointment.

#### GET /appointments/availability/{assigned_to_id}

Get available time slots.

**Query Parameters:**
- `date`: date (YYYY-MM-DD)
- `duration_minutes`: int (default 60)

**Response:**
```json
{
  "date": "2024-02-01",
  "available_slots": [
    {
      "start_time": "2024-02-01T09:00:00",
      "end_time": "2024-02-01T10:00:00",
      "is_available": true
    }
  ]
}
```

### Payments

#### POST /payments

Create payment intent.

**Request Body:**
```json
{
  "customer_id": "uuid",
  "appointment_id": "uuid",
  "amount_cents": 5000,
  "currency": "USD",
  "payment_method": "credit_card",
  "description": "Consultation service"
}
```

**Response:**
```json
{
  "client_secret": "pi_test_secret",
  "payment_intent_id": "uuid",
  "amount_cents": 5000,
  "currency": "USD"
}
```

#### GET /payments

List payments.

**Query Parameters:**
- `skip`: int
- `limit`: int
- `status`: string (optional)

#### GET /payments/{payment_id}

Get payment details.

#### POST /payments/{payment_intent_id}/confirm

Confirm payment (webhook endpoint).

#### POST /payments/{payment_id}/refund

Refund payment.

**Request Body:**
```json
{
  "reason": "Customer request",
  "amount_cents": 5000
}
```

### AI Routes

#### POST /ai/message

Process customer message with AI.

**Query Parameters:**
- `customer_id`: UUID
- `message`: string
- `conversation_history`: array (optional)

**Response:**
```json
{
  "response": "Thank you for reaching out...",
  "booking_intent": true,
  "suggested_slots": []
}
```

#### GET /ai/availability

Get available appointments for customer.

**Query Parameters:**
- `customer_id`: UUID

**Response:**
```json
{
  "available_slots": [
    {
      "start_time": "2024-02-01T10:00:00",
      "end_time": "2024-02-01T11:00:00"
    }
  ]
}
```

#### POST /ai/voice/initiate

Initiate voice call.

**Query Parameters:**
- `customer_phone`: string

#### POST /ai/chat/start

Start chat session.

**Query Parameters:**
- `customer_id`: UUID

#### GET /ai/health

Check AI service health.

**Response:**
```json
{
  "status": "healthy",
  "ai_enabled": true
}
```

### Analytics

#### GET /analytics/dashboard/summary

Get dashboard summary metrics.

**Response:**
```json
{
  "total_customers": 150,
  "total_appointments": 500,
  "completed_appointments": 450,
  "total_revenue_cents": 250000,
  "average_revenue_per_appointment": 555
}
```

#### GET /analytics/appointments/by-status

Get appointment count by status.

#### GET /analytics/customers/by-status

Get customer count by status.

#### GET /analytics/revenue/daily

Get daily revenue for specified period.

**Query Parameters:**
- `days`: int (default 30, max 365)

#### GET /analytics/appointments/daily

Get daily appointment count.

**Query Parameters:**
- `days`: int (default 30, max 365)

#### GET /analytics/top-customers

Get top customers by lifetime value.

**Query Parameters:**
- `limit`: int (default 10, max 100)

### Automations

#### POST /automations

Create automation workflow.

**Request Body:**
```json
{
  "name": "Email on Appointment",
  "description": "Send email when appointment created",
  "trigger": "appointment_created",
  "trigger_conditions": {},
  "actions": [
    {
      "type": "send_email",
      "recipient": "customer@example.com",
      "subject": "Appointment Confirmed",
      "content": "Your appointment is confirmed"
    }
  ],
  "is_active": true
}
```

#### GET /automations

List automations.

#### GET /automations/{automation_id}

Get automation details.

#### PUT /automations/{automation_id}

Update automation.

#### DELETE /automations/{automation_id}

Delete automation.

#### POST /automations/{automation_id}/toggle

Toggle automation active status.

## Rate Limiting

Default: 120 requests per minute per IP.

Headers:
- `X-RateLimit-Limit`: 120
- `X-RateLimit-Remaining`: remaining requests
- `X-RateLimit-Reset`: reset time (Unix timestamp)

## Error Responses

All errors return consistent format:

```json
{
  "detail": "Error message",
  "timestamp": "2024-01-01T00:00:00"
}
```

## Pagination

All list endpoints support pagination:

```json
{
  "items": [],
  "total": 150,
  "skip": 0,
  "limit": 50
}
```

## Filtering

Supported on list endpoints:

```
GET /customers?status=prospect&skip=0&limit=50
GET /appointments?status=confirmed&customer_id=uuid
```

## Webhooks

### Stripe Webhook

```
POST /api/v1/payments/{payment_intent_id}/confirm
```

Triggered on payment status change.

### Automation Triggers

- `appointment_created`
- `appointment_completed`
- `appointment_cancelled`
- `payment_received`
- `payment_failed`
- `customer_created`
- `customer_updated`
- `scheduled_time`
