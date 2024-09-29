-- Database-per-service. One physical Postgres instance, logical isolation
-- by separate databases so each service owns its schema migrations.

CREATE DATABASE auth_db;
CREATE DATABASE user_db;
CREATE DATABASE product_db;
CREATE DATABASE chat_db;
CREATE DATABASE notification_db;

GRANT ALL PRIVILEGES ON DATABASE auth_db         TO resell;
GRANT ALL PRIVILEGES ON DATABASE user_db         TO resell;
GRANT ALL PRIVILEGES ON DATABASE product_db      TO resell;
GRANT ALL PRIVILEGES ON DATABASE chat_db         TO resell;
GRANT ALL PRIVILEGES ON DATABASE notification_db TO resell;
