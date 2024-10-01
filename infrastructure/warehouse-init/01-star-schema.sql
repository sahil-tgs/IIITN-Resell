-- ─────────────────────────────────────────────────────────────────────────
-- Warehouse star schema. analytics-service consumes Kafka events and
-- upserts into dim_* tables, then appends rows to fact_* tables. Designed
-- for BI tools to slice/dice by category, condition, location, time.
-- ─────────────────────────────────────────────────────────────────────────

CREATE SCHEMA IF NOT EXISTS analytics;
SET search_path TO analytics, public;

-- ─── Dimensions ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dim_user (
    user_key       BIGSERIAL PRIMARY KEY,
    user_id        VARCHAR(64) NOT NULL UNIQUE,
    username       VARCHAR(64),
    email_domain   VARCHAR(64),
    is_admin       BOOLEAN DEFAULT FALSE,
    first_seen_at  TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dim_product (
    product_key     BIGSERIAL PRIMARY KEY,
    product_id      VARCHAR(64) NOT NULL UNIQUE,
    title           VARCHAR(255),
    category        VARCHAR(64),
    condition       VARCHAR(32),
    location        VARCHAR(128),
    list_price      NUMERIC(12,2),
    seller_user_key BIGINT REFERENCES dim_user(user_key),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dim_category (
    category_key BIGSERIAL PRIMARY KEY,
    category     VARCHAR(64) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS dim_date (
    date_key   INT PRIMARY KEY,           -- YYYYMMDD
    full_date  DATE NOT NULL,
    day        SMALLINT,
    month      SMALLINT,
    quarter    SMALLINT,
    year       SMALLINT,
    weekday    SMALLINT,
    is_weekend BOOLEAN
);

-- Pre-populate dim_date for a 10-year window so facts always join.
INSERT INTO dim_date (date_key, full_date, day, month, quarter, year, weekday, is_weekend)
SELECT
    TO_CHAR(d, 'YYYYMMDD')::INT,
    d::DATE,
    EXTRACT(DAY FROM d),
    EXTRACT(MONTH FROM d),
    EXTRACT(QUARTER FROM d),
    EXTRACT(YEAR FROM d),
    EXTRACT(ISODOW FROM d),
    EXTRACT(ISODOW FROM d) IN (6, 7)
FROM generate_series('2024-01-01'::DATE, '2034-12-31'::DATE, '1 day') d
ON CONFLICT DO NOTHING;

-- ─── Facts ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fact_listing (
    listing_key   BIGSERIAL PRIMARY KEY,
    product_key   BIGINT REFERENCES dim_product(product_key),
    seller_key    BIGINT REFERENCES dim_user(user_key),
    category_key  BIGINT REFERENCES dim_category(category_key),
    date_key      INT    REFERENCES dim_date(date_key),
    listed_price  NUMERIC(12,2),
    event_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fact_sale (
    sale_key     BIGSERIAL PRIMARY KEY,
    product_key  BIGINT REFERENCES dim_product(product_key),
    seller_key   BIGINT REFERENCES dim_user(user_key),
    category_key BIGINT REFERENCES dim_category(category_key),
    date_key     INT    REFERENCES dim_date(date_key),
    sale_price   NUMERIC(12,2),
    days_to_sell INT,
    event_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fact_message (
    message_key      BIGSERIAL PRIMARY KEY,
    conversation_id  VARCHAR(64),
    sender_key       BIGINT REFERENCES dim_user(user_key),
    product_key      BIGINT REFERENCES dim_product(product_key),
    date_key         INT    REFERENCES dim_date(date_key),
    message_length   INT,
    event_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fact_listing_date ON fact_listing(date_key);
CREATE INDEX IF NOT EXISTS idx_fact_sale_date    ON fact_sale(date_key);
CREATE INDEX IF NOT EXISTS idx_fact_message_date ON fact_message(date_key);
