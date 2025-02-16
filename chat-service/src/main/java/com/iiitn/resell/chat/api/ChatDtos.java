package com.iiitn.resell.chat.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class ChatDtos {

    public record StartConversationRequest(
            @NotNull UUID participantId,
            UUID productId,
            @NotBlank String initialMessage
    ) {}

    public record ConversationResponse(
            UUID id,
            UUID productId,
            List<UUID> participants,
            MessageResponse lastMessage,
            Instant createdAt,
            Instant updatedAt
    ) {}

    public record MessageResponse(
            UUID id,
            UUID conversationId,
            UUID senderId,
            String content,
            UUID productRef,
            boolean read,
            Instant createdAt
    ) {}

    public record MessagesPage(
            List<MessageResponse> messages,
            int totalPages,
            int currentPage,
            long totalMessages
    ) {}
}
