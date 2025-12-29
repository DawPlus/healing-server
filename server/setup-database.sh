#!/bin/bash

# Check if mysql client is installed
if ! command -v mysql &> /dev/null; then
    echo "MySQL client is not installed. Please install it first."
    exit 1
fi

# Load environment variables from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo ".env file not found. Using default values."
    # Default database configuration
    DB_HOST="localhost"
    DB_USER="root"
    DB_PASSWORD=""
    DB_NAME="dbstatistics"
fi

# Display database connection info
echo "Using database: $DB_NAME on $DB_HOST"

# Create database if it doesn't exist
echo "Creating database if it doesn't exist..."
mysql -h $DB_HOST -u $DB_USER ${DB_PASSWORD:+-p$DB_PASSWORD} -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"

# Process each SQL file
for SQL_FILE in new1.sql new2.sql new3.sql new4.sql new5.sql; do
    if [ -f "$SQL_FILE" ]; then
        echo "Executing $SQL_FILE..."
        mysql -h $DB_HOST -u $DB_USER ${DB_PASSWORD:+-p$DB_PASSWORD} $DB_NAME < $SQL_FILE
        
        if [ $? -eq 0 ]; then
            echo "Successfully executed $SQL_FILE"
        else
            echo "Error executing $SQL_FILE"
        fi
    else
        echo "Warning: $SQL_FILE not found"
    fi
done

echo "Database setup completed!" 