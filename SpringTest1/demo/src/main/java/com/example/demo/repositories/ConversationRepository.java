package com.example.demo.repositories;

import com.example.demo.models.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    List<Conversation> findByuser(String user);
    List<Conversation> findByConversationId(Integer conversationId);
}
