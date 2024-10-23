package com.iiitn.resell.common.event;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

/**
 * Work-queue payload sent over RabbitMQ to notification-service. Unlike
 * Kafka events (replayable, broadcast), this is per-recipient task work.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationMessage {

    public enum Channel { IN_APP, EMAIL, PUSH }

    private String recipientUserId;
    private Channel channel;
    private String title;
    private String body;
    private Map<String, String> data;
    private Instant createdAt;
}
