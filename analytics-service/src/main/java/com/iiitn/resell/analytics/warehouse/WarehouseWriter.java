package com.iiitn.resell.analytics.warehouse;

import com.iiitn.resell.common.event.ChatEvent;
import com.iiitn.resell.common.event.ProductEvent;
import com.iiitn.resell.common.event.UserEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

/**
 * Idempotent star-schema upserts. Dimension rows are unique by their natural
 * business key and protected by ON CONFLICT DO UPDATE; fact rows are appended.
 * Reading code is intentionally direct SQL — analytics writers are much
 * easier to maintain as explicit SQL than as JPA mappings spanning seven
 * tables.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WarehouseWriter {

    private static final DateTimeFormatter DATE_KEY = DateTimeFormatter.ofPattern("yyyyMMdd");
    private final JdbcTemplate jdbc;

    @Transactional
    public void recordUserEvent(UserEvent e) {
        upsertDimUser(e.getUserId(), e.getUsername(), e.getEmail(), e.isAdmin());
    }

    @Transactional
    public void recordProductEvent(ProductEvent e) {
        Long userKey     = upsertDimUser(e.getSellerId(), null, null, false);
        Long categoryKey = upsertDimCategory(e.getCategory());
        Long productKey  = upsertDimProduct(e);
        int dateKey      = toDateKey(e.getOccurredAt());

        switch (e.getType()) {
            case CREATED -> jdbc.update(
                    "INSERT INTO analytics.fact_listing (product_key, seller_key, category_key, date_key, listed_price, event_at) " +
                    "VALUES (?, ?, ?, ?, ?, ?)",
                    productKey, userKey, categoryKey, dateKey, e.getPrice(), java.sql.Timestamp.from(e.getOccurredAt()));
            case SOLD -> jdbc.update(
                    "INSERT INTO analytics.fact_sale (product_key, seller_key, category_key, date_key, sale_price, days_to_sell, event_at) " +
                    "VALUES (?, ?, ?, ?, ?, NULL, ?)",
                    productKey, userKey, categoryKey, dateKey, e.getPrice(), java.sql.Timestamp.from(e.getOccurredAt()));
            default -> log.debug("No fact emitted for product event type {}", e.getType());
        }
    }

    @Transactional
    public void recordChatEvent(ChatEvent e) {
        if (e.getType() != ChatEvent.Type.MESSAGE_SENT) return;
        Long senderKey  = upsertDimUser(e.getSenderId(), null, null, false);
        Long productKey = e.getProductId() == null ? null : findProductKey(e.getProductId());
        int dateKey     = toDateKey(e.getOccurredAt());
        jdbc.update(
                "INSERT INTO analytics.fact_message (conversation_id, sender_key, product_key, date_key, message_length, event_at) " +
                "VALUES (?, ?, ?, ?, ?, ?)",
                e.getConversationId(), senderKey, productKey, dateKey, e.getMessageLength(),
                java.sql.Timestamp.from(e.getOccurredAt()));
    }

    private Long upsertDimUser(String userId, String username, String email, boolean admin) {
        String emailDomain = email == null ? null : email.substring(email.indexOf('@') + 1);
        return jdbc.queryForObject(
                "INSERT INTO analytics.dim_user (user_id, username, email_domain, is_admin) " +
                "VALUES (?, ?, ?, ?) " +
                "ON CONFLICT (user_id) DO UPDATE SET " +
                "  username = COALESCE(EXCLUDED.username, dim_user.username), " +
                "  email_domain = COALESCE(EXCLUDED.email_domain, dim_user.email_domain), " +
                "  is_admin = EXCLUDED.is_admin, " +
                "  last_seen_at = NOW() " +
                "RETURNING user_key",
                Long.class, userId, username, emailDomain, admin);
    }

    private Long upsertDimCategory(String category) {
        if (category == null || category.isBlank()) category = "uncategorized";
        return jdbc.queryForObject(
                "INSERT INTO analytics.dim_category (category) VALUES (?) " +
                "ON CONFLICT (category) DO UPDATE SET category = EXCLUDED.category " +
                "RETURNING category_key",
                Long.class, category);
    }

    private Long upsertDimProduct(ProductEvent e) {
        Long sellerKey = upsertDimUser(e.getSellerId(), null, null, false);
        return jdbc.queryForObject(
                "INSERT INTO analytics.dim_product (product_id, title, category, condition, location, list_price, seller_user_key) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?) " +
                "ON CONFLICT (product_id) DO UPDATE SET " +
                "  title = EXCLUDED.title, category = EXCLUDED.category, " +
                "  condition = EXCLUDED.condition, location = EXCLUDED.location, " +
                "  list_price = EXCLUDED.list_price " +
                "RETURNING product_key",
                Long.class, e.getProductId(), e.getTitle(), e.getCategory(),
                e.getCondition(), e.getLocation(),
                e.getPrice() == null ? BigDecimal.ZERO : e.getPrice(), sellerKey);
    }

    private Long findProductKey(String productId) {
        try {
            return jdbc.queryForObject("SELECT product_key FROM analytics.dim_product WHERE product_id = ?",
                    Long.class, productId);
        } catch (Exception e) {
            return null;
        }
    }

    private int toDateKey(Instant ts) {
        LocalDate d = (ts == null ? Instant.now() : ts).atOffset(ZoneOffset.UTC).toLocalDate();
        return Integer.parseInt(d.format(DATE_KEY));
    }
}
