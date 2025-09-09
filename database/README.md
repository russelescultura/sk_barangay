# Database Directory

This directory contains SQL files for database setup, migrations, and updates.

## Files

### `sk_project.sql`
- Main database schema and initial data
- Contains table structures, indexes, and sample data
- Use this for initial database setup

### `update_revenue_api.sql`
- Revenue API update scripts
- Contains modifications to revenue-related tables and procedures
- Run this after the main schema is in place

## Usage

1. **Initial Setup**: Run `sk_project.sql` first to create the base database structure
2. **Updates**: Run `update_revenue_api.sql` for revenue API enhancements
3. **Backup**: Always backup your existing database before running these scripts

## Notes

- These scripts are designed for MySQL/PostgreSQL compatibility
- Some scripts may require specific database permissions
- Test in development environment before running in production
