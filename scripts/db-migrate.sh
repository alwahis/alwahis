#!/bin/bash

# Create migrations directory if it doesn't exist
mkdir -p supabase/migrations

# Function to run migrations
run_migrations() {
    for file in supabase/migrations/*.sql; do
        if [ -f "$file" ]; then
            echo "Running migration: $file"
            docker-compose exec -T db psql -U postgres -d postgres -f "/docker-entrypoint-initdb.d/$(basename $file)"
        fi
    done
}

# Start Docker services if they're not running
docker-compose up -d

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 5

# Run migrations
run_migrations

echo "Migrations completed!"
