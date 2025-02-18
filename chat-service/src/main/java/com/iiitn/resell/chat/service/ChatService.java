package com.iiitn.resell.chat.service;

import com.iiitn.resell.chat.api.ChatDtos.ConversationResponse;
import com.iiitn.resell.chat.api.ChatDtos.MessageResponse;
import com.iiitn.resell.chat.api.ChatDtos.MessagesPage;
import com.iiitn.resell.chat.api.ChatDtos.StartConversationRequest;
import com.iiitn.resell.chat.domain.*;
import com.iiitn.resell.common.event.ChatEvent;
import com.iiitn.resell.common.event.KafkaTopics;
import com.iiitn.resell.common.event.NotificationMessage;
import com.iiitn.resell.common.event.RabbitQueues;
import com.iiitn.resell.common.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversations;
    private final MessageRepository messages;
    private final KafkaTemplate<String, Object> kafka;
    private final RabbitTemplate rabbit;

    @Transactional
    public ConversationResponse startConversation(UUID userId, StartConversationRequest req) {
        // Reuse existing conversation between these two users if one exists —
        // matches the Node behavior where conversations are per-pair, not per-product.
        Conversation conv = conversations.findBetween(userId, req.participantId())
                .orElseGet(() -> createConversation(userId, req.participantId(), req.productId()));

        Message msg = messages.save(Message.builder()
                .conversationId(conv.getId())
                .senderId(userId)
                .content(req.initialMessage())
                .productRef(req.productId())
                .read(false)
                .build());

        publishChatEvent(ChatEvent.Type.MESSAGE_SENT, conv.getId(), userId, req.participantId(),
                req.productId(), msg.getContent());
        publishNotification(req.participantId().toString(), userId, msg.getContent());

        return toConversationResponse(conv, toMessageResponse(msg));
    }

    private Conversation createConversation(UUID a, UUID b, UUID productId) {
        Conversation c = Conversation.builder().productId(productId).build();
        c.getParticipants().add(ConversationParticipant.builder().conversation(c).userId(a).read(true).build());
        c.getParticipants().add(ConversationParticipant.builder().conversation(c).userId(b).read(false).build());
        Conversation saved = conversations.save(c);
        publishChatEvent(ChatEvent.Type.CONVERSATION_STARTED, saved.getId(), a, b, productId, null);
        return saved;
    }

    public List<ConversationResponse> listForUser(UUID userId) {
        return conversations.findAllForUser(userId).stream()
                .map(c -> toConversationResponse(c, null))
                .toList();
    }

    @Transactional
    public MessagesPage messagesIn(UUID conversationId, UUID userId, int page, int limit) {
        Conversation conv = conversations.findById(conversationId)
                .orElseThrow(() -> ApiException.notFound("Conversation"));
        if (conv.getParticipants().stream().noneMatch(p -> p.getUserId().equals(userId))) {
            throw ApiException.forbidden("Access denied to this conversation");
        }
        Page<Message> result = messages.findByConversationIdOrderByCreatedAtDesc(
                conversationId, PageRequest.of(page - 1, limit));
        messages.markRead(conversationId, userId);
        conv.getParticipants().stream()
                .filter(p -> p.getUserId().equals(userId))
                .forEach(p -> p.setRead(true));

        // Reverse so client sees chronological order, matching the Node API.
        List<MessageResponse> ordered = new ArrayList<>(result.map(this::toMessageResponse).getContent());
        Collections.reverse(ordered);
        return new MessagesPage(ordered, result.getTotalPages(), page, result.getTotalElements());
    }

    @Transactional
    public MessageResponse persistAndFanOut(UUID conversationId, UUID senderId, String content, UUID productId) {
        Conversation conv = conversations.findById(conversationId)
                .orElseThrow(() -> ApiException.notFound("Conversation"));
        Message msg = messages.save(Message.builder()
                .conversationId(conversationId)
                .senderId(senderId)
                .content(content)
                .productRef(productId)
                .read(false)
                .build());
        conv.getParticipants().stream()
                .filter(p -> !p.getUserId().equals(senderId))
                .forEach(p -> {
                    p.setRead(false);
                    publishNotification(p.getUserId().toString(), senderId, content);
                });

        UUID recipient = conv.getParticipants().stream()
                .map(ConversationParticipant::getUserId)
                .filter(id -> !id.equals(senderId))
                .findFirst().orElse(null);
        publishChatEvent(ChatEvent.Type.MESSAGE_SENT, conversationId, senderId, recipient,
                productId, content);
        return toMessageResponse(msg);
    }

    private void publishChatEvent(ChatEvent.Type type, UUID conversationId,
                                  UUID senderId, UUID recipientId, UUID productId, String content) {
        ChatEvent evt = ChatEvent.builder()
                .type(type)
                .conversationId(conversationId.toString())
                .senderId(senderId == null ? null : senderId.toString())
                .recipientId(recipientId == null ? null : recipientId.toString())
                .productId(productId == null ? null : productId.toString())
                .content(content)
                .messageLength(content == null ? 0 : content.length())
                .occurredAt(Instant.now())
                .build();
        kafka.send(KafkaTopics.CHAT_EVENTS, conversationId.toString(), evt);
    }

    private void publishNotification(String recipient, UUID sender, String preview) {
        NotificationMessage n = NotificationMessage.builder()
                .recipientUserId(recipient)
                .channel(NotificationMessage.Channel.IN_APP)
                .title("New message")
                .body(preview == null ? "" : (preview.length() > 80 ? preview.substring(0, 80) + "…" : preview))
                .data(Map.of("senderId", sender.toString()))
                .createdAt(Instant.now())
                .build();
        rabbit.convertAndSend(RabbitQueues.NOTIFICATION_EXCHANGE, RabbitQueues.NOTIFICATION_KEY, n);
    }

    private ConversationResponse toConversationResponse(Conversation c, MessageResponse last) {
        return new ConversationResponse(
                c.getId(),
                c.getProductId(),
                c.getParticipants().stream().map(ConversationParticipant::getUserId).toList(),
                last,
                c.getCreatedAt(),
                c.getUpdatedAt());
    }

    private MessageResponse toMessageResponse(Message m) {
        return new MessageResponse(m.getId(), m.getConversationId(), m.getSenderId(),
                m.getContent(), m.getProductRef(), m.isRead(), m.getCreatedAt());
    }
}
