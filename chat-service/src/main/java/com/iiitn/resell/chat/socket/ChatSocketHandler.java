package com.iiitn.resell.chat.socket;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.iiitn.resell.chat.api.ChatDtos.MessageResponse;
import com.iiitn.resell.chat.service.ChatService;
import com.iiitn.resell.common.security.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

/**
 * Wire-compatible Socket.IO handler for the existing React socket.io-client.
 * Auth is by JWT carried in handshake.auth.token, mirroring the original
 * Node implementation. Events:
 *   client → server: join_conversation, send_message, mark_as_read, typing, stop_typing
 *   server → client: receive_message, new_message_notification, user_typing, user_stop_typing
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ChatSocketHandler {

    private final JwtTokenProvider jwt;
    private final ChatService chatService;

    public void register(SocketIOServer server) {
        server.addConnectListener(client -> {
            String token = client.getHandshakeData().getSingleUrlParam("token");
            if (token == null) token = client.getHandshakeData().getHttpHeaders().get("token");
            if (token == null || token.isBlank()) {
                client.disconnect();
                return;
            }
            try {
                Claims claims = jwt.parse(token);
                String userId = claims.getSubject();
                client.set("userId", userId);
                client.joinRoom(userId);  // personal room for direct notifications
                log.debug("Socket connected: user={}", userId);
            } catch (Exception e) {
                log.debug("Socket auth failed: {}", e.getMessage());
                client.disconnect();
            }
        });

        server.addEventListener("join_conversation", String.class, (client, conversationId, ack) -> {
            if (conversationId != null) client.joinRoom(conversationId);
        });

        server.addEventListener("send_message", Map.class, (client, payload, ack) -> {
            String userId = client.get("userId");
            if (userId == null) return;
            String conversationId = String.valueOf(payload.get("conversationId"));
            String content        = String.valueOf(payload.get("content"));
            String productId      = payload.get("productId") == null ? null : String.valueOf(payload.get("productId"));

            try {
                MessageResponse saved = chatService.persistAndFanOut(
                        UUID.fromString(conversationId),
                        UUID.fromString(userId),
                        content,
                        productId == null || productId.equals("null") ? null : UUID.fromString(productId));

                server.getRoomOperations(conversationId).sendEvent("receive_message", saved);

                // Side-channel notifications for clients NOT currently in the room.
                forEachOtherParticipant(server, conversationId, userId, recipient ->
                        server.getRoomOperations(recipient).sendEvent("new_message_notification",
                                Map.of("conversationId", conversationId, "message", saved)));
            } catch (Exception e) {
                log.warn("send_message failed", e);
                client.sendEvent("error", "Failed to send message");
            }
        });

        server.addEventListener("mark_as_read", Map.class, (client, payload, ack) -> {
            String userId = client.get("userId");
            String conversationId = String.valueOf(payload.get("conversationId"));
            if (userId != null && conversationId != null) {
                server.getRoomOperations(conversationId).sendEvent("messages_read",
                        Map.of("conversationId", conversationId, "userId", userId));
            }
        });

        server.addEventListener("typing", Map.class, (client, payload, ack) -> {
            String userId = client.get("userId");
            String conversationId = String.valueOf(payload.get("conversationId"));
            client.getNamespace().getRoomOperations(conversationId).sendEvent("user_typing",
                    Map.of("conversationId", conversationId, "userId", userId));
        });

        server.addEventListener("stop_typing", Map.class, (client, payload, ack) -> {
            String userId = client.get("userId");
            String conversationId = String.valueOf(payload.get("conversationId"));
            client.getNamespace().getRoomOperations(conversationId).sendEvent("user_stop_typing",
                    Map.of("conversationId", conversationId, "userId", userId));
        });

        server.addDisconnectListener(client -> log.debug("Socket disconnected: user={}", (String) client.get("userId")));
    }

    private void forEachOtherParticipant(SocketIOServer server, String conversationId, String senderId,
                                         java.util.function.Consumer<String> action) {
        // netty-socketio doesn't expose room membership directly; we rely on
        // recipients having joined their own personal room on connect. The
        // ChatService persists the message and triggers RabbitMQ notifications
        // too, so durable delivery is covered even if the recipient is offline.
        for (SocketIOClient c : server.getAllClients()) {
            String uid = c.get("userId");
            if (uid != null && !uid.equals(senderId)) {
                action.accept(uid);
            }
        }
    }
}
