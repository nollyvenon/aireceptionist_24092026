# Contributing to GLACIER AI Receptionist

Thank you for contributing to GLACIER AI! This guide helps you get started.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Report security issues privately
- Follow existing code style

## Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/your-username/aireceptionist_24092026.git
cd aireceptionist_24092026
git remote add upstream https://github.com/nollyvenon/aireceptionist_24092026.git
```

### 2. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Use descriptive names:
- `feature/add-whatsapp-integration`
- `fix/appointment-conflict-detection`
- `docs/update-api-reference`

### 3. Make Changes

Follow the existing code style:

**Backend (Python)**
```python
# Use type hints
def get_customer(customer_id: UUID, db: Session) -> Customer:
    """Get customer by ID."""
    return db.query(Customer).filter(Customer.id == customer_id).first()

# Use async for API endpoints
async def list_customers(skip: int = Query(0)):
    """List customers with pagination."""
    ...
```

**Frontend (TypeScript)**
```typescript
// Use functional components
interface CustomerListProps {
  organizationId: string;
  onSelect: (customer: Customer) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({ 
  organizationId, 
  onSelect 
}) => {
  // Component code
};
```

### 4. Write Tests

**Backend**
```python
def test_create_customer(client, test_token, test_organization):
    response = client.post(
        "/api/v1/customers",
        json={
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane@example.com"
        },
        params={"token": test_token}
    )
    assert response.status_code == 200
```

**Frontend**
```typescript
import { render, screen } from '@testing-library/react';
import { CustomerForm } from './CustomerForm';

test('renders customer form', () => {
  render(<CustomerForm onSubmit={jest.fn()} />);
  expect(screen.getByLabelText('Email')).toBeInTheDocument();
});
```

### 5. Run Tests & Lint

**Backend**
```bash
cd backend
pytest -v
black . && flake8 . && isort .
```

**Frontend**
```bash
npm run lint
npm run type-check
npm test
```

### 6. Commit with Conventional Commits

```bash
git commit -m "feat: add WhatsApp integration

- Implement Twilio WhatsApp API
- Add WhatsApp to notification channels
- Update automations to support WhatsApp

Fixes #123"
```

**Commit Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, missing semicolons)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Test addition/updates
- `chore`: Build/dependency changes

### 7. Push & Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request with:
- Clear title: "Add WhatsApp integration"
- Description of changes
- Link related issues: "Fixes #123"
- Screenshots for UI changes

## Development Guidelines

### Architecture

- **Single Responsibility**: Each class/function does one thing
- **DRY**: Don't repeat yourself
- **Naming**: Use clear, descriptive names
- **Documentation**: Document public APIs

### Backend Best Practices

1. **Type Hints**: Always use type hints
```python
def create_appointment(
    appointment_data: AppointmentCreate,
    organization_id: UUID,
    db: Session
) -> Appointment:
    ...
```

2. **Error Handling**: Use specific exceptions
```python
if not customer:
    raise HTTPException(status_code=404, detail="Customer not found")
```

3. **Validation**: Use Pydantic schemas
```python
class CustomerCreate(BaseModel):
    email: EmailStr  # Validates email format
    phone: str = Field(..., regex=r"^\+?1?\d{9,15}$")
```

4. **Async**: Use async/await for I/O operations
```python
async def get_customer(customer_id: UUID, db: Session):
    return db.query(Customer).filter(...).first()
```

### Frontend Best Practices

1. **Components**: Keep components small and focused
2. **Hooks**: Use custom hooks for logic reuse
3. **Typing**: Use TypeScript strictly
4. **Testing**: Test user interactions, not implementation
5. **Accessibility**: Use semantic HTML, ARIA labels

### Database

1. **Migrations**: Always use Alembic for schema changes
```bash
alembic revision --autogenerate -m "Add field"
```

2. **Indexes**: Add indexes for frequently queried fields
```python
__table_args__ = (
    Index('idx_org_email', 'organization_id', 'email'),
)
```

3. **Relationships**: Define relationships clearly
```python
customers = relationship("Customer", cascade="all, delete-orphan")
```

## PR Review Process

1. **Automated Checks**
   - Tests must pass (GitHub Actions)
   - Code coverage >80%
   - No linting errors

2. **Manual Review**
   - Check code quality
   - Verify architecture
   - Review tests

3. **Approval**
   - At least 1 approval required
   - Maintainers will provide feedback

## Common Issues

### Tests Failing

```bash
# Run tests locally
cd backend && pytest -v

# Check specific test
pytest tests/test_customers.py::test_create_customer -v
```

### Linting Errors

```bash
# Auto-fix formatting
black .
isort .

# Check linting
flake8 .
```

### Type Errors

```bash
# Check types
cd frontend && npm run type-check
```

## Performance

- Use pagination (skip/limit) for large datasets
- Add database indexes for frequently queried fields
- Cache with Redis for read-heavy operations
- Profile code: `python -m cProfile -o out.prof main.py`

## Security

- Never commit secrets or API keys
- Validate all user input
- Use parameterized queries (ORM does this)
- Keep dependencies updated
- Run `npm audit` and `pip audit`

## Documentation

- Update README.md for user-facing changes
- Update API.md for endpoint changes
- Add docstrings to public functions
- Include examples in documentation

## Release Process

1. Update version in `package.json` and backend
2. Update CHANGELOG.md
3. Create git tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. GitHub Actions deploys automatically

## Getting Help

- Ask questions in issues
- Check existing documentation
- Review similar PRs
- Contact maintainers

## Recognition

Contributors will be:
- Added to CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

Thank you for making GLACIER AI better! 🎉
