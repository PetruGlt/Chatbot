package com.example.demo.repositories;

import com.example.demo.models.Conversation;
import com.example.demo.utils.ConversationSummaryDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    List<Conversation> findByuser(String user);
    List<Conversation> findByConversationId(Integer conversationId);
    List<Conversation> findByCheckedFalse();
    Long countDistinctByAnswerNotNull();
    Long countDistinctByCheckedTrue();
    Long countDistinctByCheckedTrueAndUpdatedResponseNull();

    @Query("SELECT new com.example.demo.utils.ConversationSummaryDTO(c.conversationId, c.question, c.answer) " +
            "FROM Conversation c " +
            "WHERE c.user = :username AND c.id IN (" +
            "  SELECT MIN(c2.id) FROM Conversation c2 WHERE c2.user = :username GROUP BY c2.conversationId" +
            ")")
    List<ConversationSummaryDTO> findFirstQuestionAndAnswerPerConversation(@Param("username") String username);
    List<Conversation> findByUserAndConversationIdAndCheckedTrue(String user, Integer conversationId);
    @Query("SELECT MAX(c.conversationId) FROM Conversation c WHERE c.user = :username")
    Integer findMaxConversationIdByUser(@Param("username") String username);

    List<Conversation> getConversationByConversationId(Integer conversationId);
}
