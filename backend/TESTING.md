# Testing Guide - GLACIER AI Backend

## Quick Start

```bash
cd backend

# Option 1: Run with PostgreSQL (recommended)
./run_tests.sh

# Option 2: Run specific test file
pytest tests/test_contacts.py -v

# Option 3: Run specific test
pytest tests/test_contacts.py::TestContactEndpoints::test_create_contact -v

# Option 4: Run with coverage
pytest tests/ --cov=app --cov-report=html
```

## Test Structure

```
backend/
├── tests/
│   ├── conftest.py              # Main test fixtures & database setup
│   ├── conftest_mock.py         # Mock fixtures (SQLite fallback)
│   ├── test_contacts.py         # Contact CRM tests (15 tests)
│   ├── test_leads.py            # Lead management tests (13 tests)
│   ├── test_deals.py            # Deal pipeline tests (16 tests)
│   ├── test_calls.py            # Call logging tests (14 tests)
│   ├── test_voicemails.py       # Voicemail tests (13 tests)
│   ├── test_appointments.py     # Appointment booking tests (15 tests)
│   ├── test_customers.py        # Customer management tests (10 tests)
│   ├── test_payments.py         # Payment processing tests (10 tests)
│   ├── test_auth.py             # Authentication tests (14 tests)
│   ├── test_organizations.py    # Organization tests (7 tests)
│   └── test_analytics.py        # Analytics tests (11 tests)
├── pytest.ini                   # Pytest configuration
├── run_tests.sh                 # Test runner script
└── TESTING.md                   # This file
```

## Test Categories

### CRM Tests (Leads, Contacts, Deals)
- **test_leads.py** - Lead scoring, status tracking, assignment
- **test_contacts.py** - Contact management, customer relationships
- **test_deals.py** - Sales pipeline, deal values, probability tracking

### Communication Tests
- **test_calls.py** - Inbound/outbound calls, transcripts, duration
- **test_voicemails.py** - Voicemail handling, transcription, listening status

### Booking Tests
- **test_appointments.py** - Scheduling, rescheduling, cancellation, status flow

### Entity Management Tests
- **test_customers.py** - Customer profiles, filtering, pagination
- **test_payments.py** - Payment status, refunds, transactions
- **test_organizations.py** - Settings, members, invitations

### Security Tests
- **test_auth.py** - Login, registration, token verification, 2FA, password reset

### Analytics Tests
- **test_analytics.py** - Dashboards, metrics, reports, exports

## Test Fixtures

### Core Fixtures
```python
@pytest.fixture
def client():
    """FastAPI TestClient"""
    return TestClient(app)

@pytest.fixture
def db():
    """SQLAlchemy session for tests"""
    session = TestingSessionLocal()
    yield session
    session.close()

@pytest.fixture
def auth_headers(test_auth_token):
    """Authorization headers with Bearer token"""
    return {"Authorization": f"Bearer {test_auth_token}"}
```

### Entity Fixtures
```python
@pytest.fixture
def test_organization(db):
    """Create test organization"""
    org = Organization(name="Test Org", slug=f"test-org-{uuid4().hex[:8]}")
    db.add(org)
    db.commit()
    db.refresh(org)
    return org

@pytest.fixture
def test_user(db, test_organization):
    """Create test user"""
    user = User(
        organization_id=test_organization.id,
        email=f"testuser_{uuid4().hex}@example.com",
        password_hash=AuthService.hash_password("testpass123"),
        first_name="Test",
        last_name="User",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def test_auth_token(test_user):
    """Create JWT token for test user"""
    return AuthService.create_access_token(str(test_user.id), 3600)
```

## Running Tests by Category

```bash
# Run only CRM tests
pytest tests/test_contacts.py tests/test_leads.py tests/test_deals.py -v

# Run only communication tests
pytest tests/test_calls.py tests/test_voicemails.py -v

# Run only with authentication
pytest tests/test_auth.py tests/test_organizations.py -v

# Run specific test class
pytest tests/test_contacts.py::TestContactEndpoints -v

# Run specific test method
pytest tests/test_contacts.py::TestContactEndpoints::test_create_contact -v

# Run by marker
pytest -m integration -v
pytest -m auth -v
```

## Pytest Markers

Use markers to run specific test categories:

```bash
# Integration tests (require database)
pytest -m integration -v

# Auth tests only
pytest -m auth -v

# CRM module tests
pytest -m crm -v

# Communication tests
pytest -m communication -v

# Appointment tests
pytest -m appointments -v

# Payment tests
pytest -m payments -v

# Analytics tests
pytest -m analytics -v
```

## Database Configuration

### PostgreSQL (Recommended)

```bash
# Start PostgreSQL
brew services start postgresql  # macOS
systemctl start postgresql       # Linux

# Create test database
createdb test_glacier_ai

# Run tests
pytest tests/ -v
```

### SQLite (Default, Limited Support)

SQLite is used by default but has limitations:
- UUID columns stored as TEXT
- No native UUID type support
- Foreign key constraints available

Tests will work but with warnings about UUID type incompatibility.

### MySQL/MariaDB

To use MySQL instead of PostgreSQL:

1. Update `conftest.py`:
```python
TEST_DATABASE_URL = "mysql+pymysql://user:password@localhost/test_glacier_ai"
```

2. Create test database:
```bash
mysql -u root -p -e "CREATE DATABASE test_glacier_ai;"
```

3. Run tests:
```bash
pytest tests/ -v
```

## Coverage Analysis

```bash
# Generate HTML coverage report
pytest tests/ --cov=app --cov-report=html

# View report
open htmlcov/index.html  # macOS
firefox htmlcov/index.html  # Linux

# Coverage by module
pytest tests/ --cov=app --cov-report=term-missing

# Minimum coverage requirement (80%)
pytest tests/ --cov=app --cov-fail-under=80
```

## Test Patterns

### Pattern 1: Empty Dataset
```python
def test_list_contacts_empty(self, client, auth_headers, test_auth_token):
    response = client.get("/api/v1/crm/contacts", headers=auth_headers, 
                         params={"token": test_auth_token})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert len(data["data"]) == 0
```

### Pattern 2: CRUD Operations
```python
# CREATE
response = client.post("/api/v1/crm/contacts", json=contact_data)
assert response.status_code == 200
id = response.json()["id"]

# READ
response = client.get(f"/api/v1/crm/contacts/{id}")
assert response.status_code == 200

# UPDATE
response = client.put(f"/api/v1/crm/contacts/{id}", json=update_data)
assert response.status_code in [200, 204]

# DELETE
response = client.delete(f"/api/v1/crm/contacts/{id}")
assert response.status_code in [200, 204]
```

### Pattern 3: Filtering & Pagination
```python
# Filter by customer
response = client.get("/api/v1/crm/contacts",
    params={"token": test_auth_token, "customer_id": str(customer_id)})
assert response.status_code == 200
assert response.json()["total"] >= 1

# Pagination
response = client.get("/api/v1/crm/contacts",
    params={"token": test_auth_token, "skip": 0, "limit": 10})
assert len(response.json()["data"]) <= 10
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_DB: test_glacier_ai
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: 3.11
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov
      
      - name: Run tests
        run: pytest tests/ -v --cov=app --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Troubleshooting

### Issue: UUID type errors with SQLite
**Solution**: Use PostgreSQL or modify models to use String type for test database

### Issue: Foreign key constraint violations
**Cause**: Not enabling foreign keys in SQLite
**Solution**: Already handled in conftest.py with `PRAGMA foreign_keys=ON`

### Issue: Tests pass locally but fail in CI
**Cause**: Different database or environment
**Solution**: Use pytest-postgresql for consistent PostgreSQL in CI

### Issue: Test database locked
**Cause**: Previous test session didn't close properly
**Solution**: Delete `.pytest_cache/` and restart

## Performance Tips

1. **Run tests in parallel** (requires pytest-xdist):
```bash
pip install pytest-xdist
pytest tests/ -n auto
```

2. **Run only failed tests**:
```bash
pytest tests/ --lf  # Last failed
pytest tests/ --ff  # Failed first
```

3. **Stop on first failure**:
```bash
pytest tests/ -x   # Stop at first failure
pytest tests/ -s   # Show print statements
```

4. **Faster fixture teardown**:
```bash
pytest tests/ -p no:cacheprovider  # Disable caching
```

## Best Practices

✅ **DO**:
- Write tests for all endpoints
- Use fixtures for data setup
- Test both success and failure cases
- Verify organization isolation
- Test pagination and filtering
- Check authorization on protected endpoints

❌ **DON'T**:
- Use hardcoded IDs or emails
- Skip authorization tests
- Assume test data persists between tests
- Test private methods directly
- Mock external services without reason
- Leave tests interdependent

## Test Statistics

- **Total Tests**: 140+
- **Test Files**: 11
- **Coverage Target**: 80%+
- **Estimated Runtime**: 30-60 seconds (with PostgreSQL)
- **Database Overhead**: ~2 seconds setup, auto-reset between tests

## Contributing Tests

When adding new features:

1. Create test method in appropriate module
2. Use existing fixtures
3. Follow naming convention: `test_<action>_<scenario>`
4. Add docstring explaining what's tested
5. Verify test passes locally
6. Run full suite before committing

Example:
```python
def test_create_contact_with_customer(self, client, auth_headers, test_customer, test_auth_token):
    """Test creating contact linked to specific customer"""
    contact_data = {
        "customer_id": str(test_customer.id),
        "first_name": "Jane",
        "last_name": "Doe",
        "email": "jane@example.com",
    }
    response = client.post("/api/v1/crm/contacts", json=contact_data,
                         headers=auth_headers, params={"token": test_auth_token})
    assert response.status_code == 200
    assert response.json()["email"] == contact_data["email"]
```

## References

- [pytest Documentation](https://docs.pytest.org/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [SQLAlchemy Testing](https://docs.sqlalchemy.org/en/20/orm/session_basics.html)
- [pytest-postgresql](https://pytest-postgresql.readthedocs.io/)
