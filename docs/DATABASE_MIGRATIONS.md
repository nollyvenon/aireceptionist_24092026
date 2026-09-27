# Database Migrations Guide

**Status**: ✅ Alembic initialized and configured  
**Current Version**: 001_initial_migration  
**Last Updated**: 2026-09-27

## Overview

The GLACIER AI backend uses **Alembic** for database migrations, providing version control and safe database schema evolution.

## Alembic Configuration

### Setup
- **Location**: `/backend/migrations/`
- **Config**: `/backend/alembic.ini`
- **Environment**: `/backend/migrations/env.py`

### Key Settings
- **Database**: PostgreSQL 13+
- **Auto-detection**: Enabled via `env.py` imports
- **Batch Mode**: Enabled for broader SQLite compatibility
- **Default Connection**: `postgresql://glacier_user:glacier_password@localhost:5432/glacier_ai`

## Existing Migrations

### 001_initial_migration.py
Creates all base tables for the application:

**Core Tables**:
- `organizations` - Multi-tenant organization data
- `users` - User accounts and authentication
- `customers` - Customer/client information
- `appointments` - Appointment bookings
- `payments` - Payment transactions

**CRM Tables**:
- `leads` - Sales leads with scoring
- `contacts` - Contact information
- `deals` - Sales deals and pipeline

**Communication Tables**:
- `calls` - Call logs and recordings
- `voicemails` - Voicemail messages

**Compliance Tables**:
- `audit_logs` - Audit trail for compliance

**Indexes**:
- Organization isolation indexes
- Status and type indexes
- Date and relationship indexes

## Using Migrations

### View Migration History
```bash
cd backend
alembic current           # Show current revision
alembic history          # Show all revisions
```

### Apply Migrations
```bash
# Apply all pending migrations
alembic upgrade head

# Apply specific number of revisions
alembic upgrade +2

# Apply to specific revision
alembic upgrade 001_initial
```

### Rollback Migrations
```bash
# Rollback one revision
alembic downgrade -1

# Rollback to specific revision
alembic downgrade 001_initial

# Rollback all
alembic downgrade base
```

### Create New Migration

#### Automatic (Recommended)
```bash
# When database is running
alembic revision --autogenerate -m "Description of changes"
```

#### Manual
```bash
# Creates empty migration template
alembic revision -m "Description of changes"
# Edit the generated file in migrations/versions/
```

## Migration Files

### Naming Convention
- Pattern: `XXX_descriptive_name.py`
- Example: `001_initial_migration.py`, `002_add_user_roles.py`

### Structure
```python
"""Description of migration"""
from alembic import op
import sqlalchemy as sa

revision = 'XXX_name'
down_revision = 'previous_revision_id'

def upgrade() -> None:
    """Apply migration (forward)"""
    # Your upgrade logic
    pass

def downgrade() -> None:
    """Revert migration (backward)"""
    # Your downgrade logic
    pass
```

## Model Changes Workflow

1. **Modify Model** in `/app/models/`
2. **Generate Migration**:
   ```bash
   alembic revision --autogenerate -m "Add new_field to User"
   ```
3. **Review Generated Migration**
4. **Test Migration**:
   ```bash
   alembic upgrade head  # Apply
   alembic downgrade -1  # Rollback (test)
   alembic upgrade head  # Apply again
   ```
5. **Commit** migration file with code changes

## Production Deployment

### Pre-deployment Checklist
- [ ] All migrations reviewed
- [ ] Test database schema matches production
- [ ] Backup production database
- [ ] Plan rollback strategy

### Deployment Steps
```bash
# 1. Test migrations on staging
alembic upgrade head

# 2. Deploy code
git push production main

# 3. Run migrations on production
alembic upgrade head

# 4. Verify schema
alembic current
alembic history
```

### Rollback Plan
If issues occur:
```bash
# Rollback to previous version
alembic downgrade -1

# Investigate and fix
# Reapply migrations
alembic upgrade head
```

## Best Practices

### DO:
- ✅ Auto-generate migrations for schema changes
- ✅ Review generated migrations before committing
- ✅ Test migrations before production deployment
- ✅ Use descriptive migration names
- ✅ Commit migrations with related code changes
- ✅ Keep migrations small and focused

### DON'T:
- ❌ Manually edit alembic version tables
- ❌ Skip migration reviews
- ❌ Force push migrations to production
- ❌ Edit old migration files (create new ones instead)
- ❌ Assume rollbacks will work (test them!)

## Common Issues

### Connection Refused
**Problem**: `Connection refused` when running migrations
**Solution**: Ensure PostgreSQL is running on localhost:5432

### No tables in database
**Problem**: Migration says it can't find tables for comparison
**Solution**: First run `alembic upgrade head` to create tables

### Invalid migration ID
**Problem**: `FAILED: No migration for X` 
**Solution**: Check migration file naming and revision IDs are correct

## Advanced Topics

### Multi-database Support
Currently configured for PostgreSQL. To add support for other databases:
1. Update `alembic.ini` with connection string
2. Ensure models use compatible column types
3. Test migrations on target database

### Offline Mode
Generate migration SQL without connecting to database:
```bash
alembic upgrade head --sql
```

### Verbose Logging
See detailed migration logs:
```bash
# Edit alembic.ini
[logger_alembic]
level = DEBUG  # Changed from INFO
```

## References

- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [SQLAlchemy Migrations](https://docs.sqlalchemy.org/en/20/topics/ddl_constructs.html)
- [PostgreSQL Compatibility](https://www.postgresql.org/docs/)

## Support

For migration issues:
1. Check Alembic logs for error details
2. Verify database connection and credentials
3. Review migration file for SQL syntax errors
4. Test on local database first
5. Check git history for related model changes
