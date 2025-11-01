# Database Migrations

This directory contains database migration scripts for upgrading the Track the Thing database schema.

## Running Migrations

### Individual Migration

To run a specific migration:

```bash
# Apply migration
python migrations/001_add_title_field.py up

# Rollback migration
python migrations/001_add_title_field.py down
```

### All Migrations

To run all pending migrations:

```bash
python migrations/run_migrations.py
```

## Using Docker

If you're running the app in Docker:

```bash
# Apply migrations
docker-compose exec backend python migrations/001_add_title_field.py up

# Or run all migrations
docker-compose exec backend python migrations/run_migrations.py
```

## Migration List

| Version | Description | Date |
|---------|-------------|------|
| 001 | Add title field to note_entries | 2025-10-30 |

## Creating New Migrations

When creating a new migration:

1. Name it with the next sequential number: `00X_descriptive_name.py`
2. Include both `migrate_up()` and `migrate_down()` functions
3. Make migrations idempotent (safe to run multiple times)
4. Test both up and down migrations
5. Update this README with the migration details

## Notes

- Migrations are designed to work with SQLite
- Each migration checks if changes are already applied before running
- Always backup your database before running migrations manually
- The Docker setup automatically runs migrations on startup

