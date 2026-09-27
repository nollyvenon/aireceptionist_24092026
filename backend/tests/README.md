# Integration Tests for GLACIER AI Backend

## Test Files Created

### Entity-Specific Tests
- **test_contacts.py** - Contact management (CRUD, filtering, pagination)
- **test_leads.py** - Lead management (CRUD, status filtering, scoring)
- **test_deals.py** - Deal pipeline (CRUD, status tracking, value management)
- **test_calls.py** - Call logging (inbound/outbound, type filtering, transcript handling)
- **test_voicemails.py** - Voicemail management (transcription, listening status, pagination)
- **test_appointments.py** - Appointment booking (scheduling, rescheduling, cancellation)
- **test_customers.py** - Customer profiles (CRUD, status filtering, search)
- **test_payments.py** - Payment processing (status tracking, refunds, transaction logging)
- **test_auth.py** - Authentication flows (login, registration, 2FA, password reset)
- **test_organizations.py** - Organization management (settings, members, invitations)
- **test_analytics.py** - Analytics and reporting (dashboards, metrics, exports)

## Test Coverage

Each test module includes:
- Empty dataset scenarios
- CRUD operations (Create, Read, Update, Delete)
- Filtering by various fields
- Pagination
- Authorization checks
- Error handling
- Business logic validation

### Example Test Classes
```python
class TestContactEndpoints:
    - test_list_contacts_empty()
    - test_create_contact()
    - test_get_contact_by_id()
    - test_update_contact()
    - test_delete_contact()
    - test_pagination_contacts()
    - test_contact_isolation_by_organization()
```

## Test Configuration (conftest.py)

### Fixtures Provided
- `client` - FastAPI TestClient
- `db` - SQLAlchemy test session
- `auth_headers` - Authorization headers with Bearer token
- `test_auth_token` - JWT token for authenticated requests

### Entity Fixtures
- `test_organization` - Organization entity
- `test_user` - User with authentication
- `test_customer` - Customer record
- `test_lead` - Lead with scoring
- `test_contact` - Contact linked to customer
- `test_deal` - Deal in pipeline
- `test_appointment` - Scheduled appointment
- `test_payment` - Payment transaction
- `test_call` - Call log
- `test_voicemail` - Voicemail record

### Database Setup
- In-memory SQLite for fast tests
- Auto-reset before each test
- Foreign key constraint support
- Transaction isolation

## Running Tests

```bash
# Run all tests
pytest tests/

# Run specific test file
pytest tests/test_contacts.py

# Run specific test class
pytest tests/test_contacts.py::TestContactEndpoints

# Run specific test
pytest tests/test_contacts.py::TestContactEndpoints::test_create_contact

# Run with verbose output
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=app --cov-report=html
```

## Test Statistics

- **Total Test Files**: 11
- **Total Test Classes**: 11
- **Total Test Methods**: ~140+
- **Coverage Areas**: 
  - CRM (Leads, Contacts, Deals)
  - Communication (Calls, Voicemails)
  - Booking (Appointments)
  - Customers & Payments
  - Authentication & Authorization
  - Organizations & Settings
  - Analytics & Reporting

## Known Issues & Solutions

### SQLite UUID Type Issue
The test database uses SQLite which doesn't natively support PostgreSQL's UUID type. 

**Solutions**:
1. Use pytest-postgresql plugin with actual PostgreSQL database
2. Modify models to use GUID type from sqlalchemy-utils
3. Mock the database layer for unit tests

### Current Status
- Test files created ✅
- Test fixtures configured ✅
- Database schema issues identified ⚠️
- Tests ready for CI/CD integration (pending DB config)

## Next Steps

1. **Configure Test Database**
   - Option A: Install pytest-postgresql for real PostgreSQL tests
   - Option B: Use sqlalchemy-utils GUID type for SQLite compatibility
   - Option C: Mock database layer for unit tests

2. **Run Full Test Suite**
   ```bash
   pytest tests/ -v --tb=short
   ```

3. **Generate Coverage Report**
   ```bash
   pytest tests/ --cov=app --cov-report=html
   ```

4. **Integrate with CI/CD**
   - Add to GitHub Actions workflow
   - Set minimum coverage threshold
   - Block merges if tests fail

## Test Patterns Used

### Pattern 1: Empty Dataset
```python
def test_list_contacts_empty(self, client, auth_headers, test_auth_token):
    response = client.get("/api/v1/crm/contacts", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
```

### Pattern 2: CRUD Operations
```python
# Create
response = client.post("/api/v1/crm/contacts", json=contact_data)
assert "id" in response.json()

# Read
response = client.get(f"/api/v1/crm/contacts/{contact_id}")
assert response.status_code == 200

# Update
response = client.put(f"/api/v1/crm/contacts/{contact_id}", json=update_data)
assert response.status_code in [200, 204]

# Delete
response = client.delete(f"/api/v1/crm/contacts/{contact_id}")
assert response.status_code in [200, 204]
```

### Pattern 3: Filtering & Pagination
```python
def test_list_with_filter(self, client, auth_headers, test_auth_token):
    response = client.get(
        "/api/v1/crm/contacts",
        params={
            "token": test_auth_token,
            "customer_id": str(customer_id),
            "skip": 0,
            "limit": 10
        }
    )
    assert response.status_code == 200
```

## Best Practices Applied

✅ Fixture-based test setup
✅ Isolation between tests (auto-reset DB)
✅ Multi-scenario testing (empty, single, multiple)
✅ Authorization checks
✅ Error scenario coverage
✅ Pagination testing
✅ Organization isolation validation
✅ Consistent test naming
✅ Clear assertions
✅ No hardcoded IDs or credentials
