package com.iiitn.resell.chat.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    Page<Message> findByConversationIdOrderByCreatedAtDesc(UUID conversationId, Pageable pageable);

    @Modifying
    @Query("""
        UPDATE Message m SET m.read = true
        WHERE m.conversationId = :conversationId
          AND m.senderId <> :userId
          AND m.read = false
    """)
    int markRead(UUID conversationId, UUID userId);
}
