#!/bin/sh
set -e

echo "Waiting for database to be ready..."
# Wait for postgres to be ready
until nc -z postgres 5432; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

echo "Database is ready. Running migrations..."
cd /app/packages/database
npx prisma migrate deploy

echo "Checking if database needs seeding..."
# Check if database is empty (optional seeding)
if [ "$SEED_DATABASE" = "true" ]; then
  echo "Seeding database..."
  npm run seed
fi

echo "Starting API server..."
cd /app/packages/api
exec "$@"
