package com.iiitn.resell.common.event;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Domain event published on topic `product.events.v1` by product-service.
 * Consumed by search-service (Elasticsearch indexing), analytics-service
 * (warehouse facts), and notification-service (sale notifications).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductEvent {

    public enum Type { CREATED, UPDATED, DELETED, SOLD }

    private Type type;
    private String productId;
    private String sellerId;
    private String title;
    private String description;
    private BigDecimal price;
    private String category;
    private String condition;
    private String location;
    private String imageUrl;
    private boolean sold;
    private Instant occurredAt;
}
