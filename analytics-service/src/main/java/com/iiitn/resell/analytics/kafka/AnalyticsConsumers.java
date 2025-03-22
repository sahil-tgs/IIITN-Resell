package com.iiitn.resell.analytics.kafka;

import com.iiitn.resell.analytics.warehouse.WarehouseWriter;
import com.iiitn.resell.common.event.ChatEvent;
import com.iiitn.resell.common.event.KafkaTopics;
import com.iiitn.resell.common.event.ProductEvent;
import com.iiitn.resell.common.event.UserEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AnalyticsConsumers {

    private final WarehouseWriter writer;

    @KafkaListener(topics = KafkaTopics.USER_EVENTS, groupId = "analytics-service",
            containerFactory = "userEventListenerContainerFactory")
    public void onUser(UserEvent e) {
        try { writer.recordUserEvent(e); }
        catch (Exception ex) { log.error("warehouse user-event write failed", ex); }
    }

    @KafkaListener(topics = KafkaTopics.PRODUCT_EVENTS, groupId = "analytics-service",
            containerFactory = "productEventListenerContainerFactory")
    public void onProduct(ProductEvent e) {
        try { writer.recordProductEvent(e); }
        catch (Exception ex) { log.error("warehouse product-event write failed", ex); }
    }

    @KafkaListener(topics = KafkaTopics.CHAT_EVENTS, groupId = "analytics-service",
            containerFactory = "chatEventListenerContainerFactory")
    public void onChat(ChatEvent e) {
        try { writer.recordChatEvent(e); }
        catch (Exception ex) { log.error("warehouse chat-event write failed", ex); }
    }
}
