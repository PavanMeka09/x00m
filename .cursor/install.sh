#!/usr/bin/env bash
set -euo pipefail

cd /workspace

# Ensure PostgreSQL is available (installed in base snapshot).
if command -v pg_ctlcluster >/dev/null 2>&1; then
  sudo pg_ctlcluster 16 main start >/dev/null 2>&1 || true
fi

# Create local database role/database if missing.
if command -v psql >/dev/null 2>&1 && sudo -u postgres psql -tAc "SELECT 1" >/dev/null 2>&1; then
  sudo -u postgres psql -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'x00m') THEN
    CREATE ROLE x00m WITH LOGIN PASSWORD 'x00m' CREATEDB;
  END IF;
END
$$;
SELECT 'CREATE DATABASE x00m OWNER x00m'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'x00m')\gexec
GRANT ALL PRIVILEGES ON DATABASE x00m TO x00m;
SQL
fi

npm ci

export DATABASE_URL="${DATABASE_URL:-postgresql://x00m:x00m@localhost:5432/x00m?schema=public}"
npx prisma generate
npx prisma db push
