#!/bin/sh

set -e

echo "Running Prisma migrations..."
cd /app/apps/api
./node_modules/.bin/prisma migrate deploy

echo "Starting API (serving both API and frontend)..."
cd /app
exec node apps/api/dist/main.js