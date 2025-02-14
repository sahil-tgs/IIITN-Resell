package com.iiitn.resell.chat.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    @Query("""
        SELECT c FROM Conversation c
        JOIN c.participants p
        WHERE p.userId = :userId
        ORDER BY c.updatedAt DESC
    """)
    List<Conversation> findAllForUser(UUID userId);

    @Query("""
        SELECT c FROM Conversation c
        WHERE EXISTS (SELECT 1 FROM ConversationParticipant p1 WHERE p1.conversation = c AND p1.userId = :a)
          AND EXISTS (SELECT 1 FROM ConversationParticipant p2 WHERE p2.conversation = c AND p2.userId = :b)
    """)
    Optional<Conversation> findBetween(UUID a, UUID b);
}
