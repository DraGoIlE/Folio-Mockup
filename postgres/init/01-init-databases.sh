#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE auth_db;
    CREATE DATABASE users_db;
EOSQL

echo "Restoring auth_db"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "auth_db" < /docker-entrypoint-initdb.d/auth_db_dump.sql

echo "Restoring users_db"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "