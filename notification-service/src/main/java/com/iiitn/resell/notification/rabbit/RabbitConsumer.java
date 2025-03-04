package com.iiitn.resell.notification.rabbit;

import com.iiitn.resell.common.event.NotificationMessage;
import com.iiitn.resell.common.event.RabbitQueues;
import com.iiitn.resell.notification.domain.Notification;
import com.iiitn.resell.notification.domain.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

/**
 * Drains the notification.dispatch queue and persists each notification. In a
 * real deployment this would also call out to APNs/FCM/SES — here we stop at
 * the database write + structured log to demonstrate the consumer pattern.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RabbitConsumer {

    private final NotificationRepository repo;

    @RabbitListener(queues = RabbitQueues.NOTIFICATION_QUEUE)
    public void onMessage(NotificationMessage msg) {
        try {
            Notification n = Notification.builder()
                    .recipientId(UUID.fromString(msg.getRecipientUserId()))
                    .channel(msg.getChannel().name())
                    .title(msg.getTitle())
                    .body(msg.getBody())
                    .data(msg.getData())
                    .deliveredAt(Instant.now())
                    .build();
            repo.save(n);
            log.info("Notification persisted recipient={} channel={}", n.getRecipientId(), n.getChannel());
        } catch (Exception e) {
            log.error("Notification handling failed; will retry", e);
            throw e;  // triggers Rabbit retry / DLQ per listener config
        }
    }
}
