package com.iiitn.resell.chat.api;

import com.iiitn.resell.chat.api.ChatDtos.ConversationResponse;
import com.iiitn.resell.chat.api.ChatDtos.MessagesPage;
import com.iiitn.resell.chat.api.ChatDtos.StartConversationRequest;
import com.iiitn.resell.chat.service.ChatService;
import com.iiitn.resell.common.security.AuthenticatedUser;
import com.iiitn.resell.common.security.CurrentUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/conversations")
    public ResponseEntity<ConversationResponse> start(
            @CurrentUser AuthenticatedUser user,
            @Valid @RequestBody StartConversationRequest req) {
        return ResponseEntity.status(201).body(
                chatService.startConversation(UUID.fromString(user.userId()), req));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponse>> mine(@CurrentUser AuthenticatedUser user) {
        return ResponseEntity.ok(chatService.listForUser(UUID.fromString(user.userId())));
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<MessagesPage> messages(
            @CurrentUser AuthenticatedUser user,
            @PathVariable("id") UUID id,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(chatService.messagesIn(id, UUID.fromString(user.userId()), page, limit));
    }
}
