CREATE TABLE credentials (
    id              UUID PRIMARY KEY,
    email           VARCHAR(255) UNIQUE NOT NULL,
    username        VARCHAR(64)  UNIQUE NOT NULL,
    password_hash   VARCHAR(255),
    google_id       VARCHAR(64)  UNIQUE,
    is_admin        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credentials_email     ON credentials(email);
CREATE INDEX idx_credentials_google_id ON credentials(google_id);
