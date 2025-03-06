package com.iiitn.resell.notification.kafka;

import com.iiitn.resell.common.event.KafkaTopics;
import com.iiitn.resell.common.event.ProductEvent;
import com.iiitn.resell.notification.domain.Notification;
import com.iiitn.resell.notification.domain.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Hybrid pattern: subscribes to product.events.v1 so that whenever a listing
 * is marked SOLD, the seller gets a congratulatory in-app notification. This
 * is the Kafka "broadcast" use-case sitting alongside RabbitMQ's per-recipient
 * work-queue use-case — exactly what a Java SDE interview will ask you to
 * compare.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ProductEventConsumer {

    private final NotificationRepository repo;

    @KafkaListener(topics = KafkaTopics.PRODUCT_EVENTS, groupId = "notification-service")
    public void onProductEvent(ProductEvent evt) {
        if (evt == null || evt.getType() != ProductEvent.Type.SOLD) return;
        repo.save(Notification.builder()
                .recipientId(UUID.fromString(evt.getSellerId()))
                .channel("IN_APP")
                .title("Your listing sold")
                .body("Your item \"" + evt.getTitle() + "\" has been marked as sold.")
                .data(Map.of("productId", evt.getProductId()))
                .deliveredAt(Instant.now())
                .build());
        log.info("Sale notification queued for seller {}", evt.getSellerId());
    }
}
