CREATE TABLE notifications (
    id              UUID PRIMARY KEY,
    recipient_id    UUID NOT NULL,
    channel         VARCHAR(16) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    body            TEXT,
    data            JSONB,
    read            BOOLEAN NOT NULL DEFAULT FALSE,
    delivered_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, created_at DESC);
CREATE INDEX idx_notifications_unread    ON notifications(recipient_id, read);
