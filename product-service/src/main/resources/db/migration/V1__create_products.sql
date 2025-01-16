CREATE TABLE products (
    id           UUID PRIMARY KEY,
    seller_id    UUID NOT NULL,
    title        VARCHAR(255) NOT NULL,
    description  TEXT NOT NULL DEFAULT '',
    price        NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    image_url    TEXT NOT NULL,
    category     VARCHAR(64) NOT NULL DEFAULT '',
    condition    VARCHAR(32) NOT NULL DEFAULT '',
    location     VARCHAR(128) NOT NULL DEFAULT '',
    is_sold      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category  ON products(category);
CREATE INDEX idx_products_price     ON products(price);
CREATE INDEX idx_products_is_sold   ON products(is_sold);
CREATE INDEX idx_products_filter    ON products(category, is_sold, price);
