package com.iiitn.resell.common.event;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Published on `chat.events.v1`. Used by analytics for fact_message and by
 * notification-service to drive in-app/email notifications.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatEvent {

    public enum Type { CONVERSATION_STARTED, MESSAGE_SENT }

    private Type type;
    private String conversationId;
    private String senderId;
    private String recipientId;
    private String productId;
    private String content;
    private int messageLength;
    private Instant occurredAt;
}
