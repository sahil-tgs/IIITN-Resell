CREATE TABLE user_profiles (
    user_id          UUID PRIMARY KEY,           -- mirrors auth-service credentials.id
    username         VARCHAR(64) NOT NULL,
    email            VARCHAR(255) NOT NULL,
    profile_picture  TEXT,
    bio              TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON user_profiles(email);
