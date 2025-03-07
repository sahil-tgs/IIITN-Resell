package com.iiitn.resell.notification.api;

import com.iiitn.resell.common.security.AuthenticatedUser;
import com.iiitn.resell.common.security.CurrentUser;
import com.iiitn.resell.notification.domain.Notification;
import com.iiitn.resell.notification.domain.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository repo;

    @GetMapping
    public ResponseEntity<List<Notification>> mine(@CurrentUser AuthenticatedUser user) {
        return ResponseEntity.ok(repo.findByRecipientIdOrderByCreatedAtDesc(UUID.fromString(user.userId())));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unread(@CurrentUser AuthenticatedUser user) {
        return ResponseEntity.ok(Map.of("count",
                repo.countByRecipientIdAndReadFalse(UUID.fromString(user.userId()))));
    }
}
