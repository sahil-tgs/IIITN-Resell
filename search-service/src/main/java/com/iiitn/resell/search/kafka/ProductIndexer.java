package com.iiitn.resell.search.kafka;

import com.iiitn.resell.common.event.KafkaTopics;
import com.iiitn.resell.common.event.ProductEvent;
import com.iiitn.resell.search.domain.ProductDocument;
import com.iiitn.resell.search.domain.ProductSearchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Read-side projection: the source of truth lives in product-service's
 * Postgres; search-service derives a denormalized ES copy by consuming
 * product.events.v1. This is CQRS-lite — fast keyword/full-text search
 * without coupling to the write model.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ProductIndexer {

    private final ProductSearchRepository repo;

    @KafkaListener(topics = KafkaTopics.PRODUCT_EVENTS, groupId = "search-service")
    public void onEvent(ProductEvent evt) {
        if (evt == null || evt.getType() == null) return;
        switch (evt.getType()) {
            case CREATED, UPDATED, SOLD -> repo.save(toDoc(evt));
            case DELETED                -> repo.deleteById(evt.getProductId());
        }
        log.debug("Indexed product {} ({})", evt.getProductId(), evt.getType());
    }

    private ProductDocument toDoc(ProductEvent e) {
        return ProductDocument.builder()
                .id(e.getProductId())
                .title(e.getTitle())
                .description(e.getDescription())
                .sellerId(e.getSellerId())
                .category(e.getCategory())
                .condition(e.getCondition())
                .location(e.getLocation())
                .price(e.getPrice())
                .sold(e.isSold())
                .imageUrl(e.getImageUrl())
                .indexedAt(Instant.now())
                .build();
    }
}
