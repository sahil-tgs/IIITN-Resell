package com.iiitn.resell.user.kafka;

import com.iiitn.resell.common.event.KafkaTopics;
import com.iiitn.resell.common.event.UserEvent;
import com.iiitn.resell.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Listens to user.events.v1 — when auth-service publishes a REGISTERED
 * event, mirror the identity into our local profile table. Eventual
 * consistency replaces the cross-service synchronous call.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UserEventConsumer {

    private final UserService userService;

    @KafkaListener(topics = KafkaTopics.USER_EVENTS, groupId = "user-service-mirror")
    public void onUserEvent(UserEvent evt) {
        if (evt == null || evt.getType() == null) return;
        switch (evt.getType()) {
            case REGISTERED, UPDATED ->
                userService.upsertOnRegister(UUID.fromString(evt.getUserId()), evt.getUsername(), evt.getEmail());
            case DELETED ->
                userService.delete(UUID.fromString(evt.getUserId()));
            default -> {/* LOGGED_IN — ignored here */}
        }
    }
}
