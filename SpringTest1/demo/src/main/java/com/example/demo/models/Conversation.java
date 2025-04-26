package com.example.demo.models;

import jakarta.persistence.*;

import java.time.LocalDateTime;


@Table(name = "conversation_history")
@Entity
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user", nullable = false, columnDefinition = "TEXT")
    private String user;

    @Column(name = "conversation_id", nullable = false, columnDefinition = "INTEGER")
    private Integer conversationId;

    @Column(name = "question", nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(name = "answer", nullable = false, columnDefinition = "TEXT")
    private String answer;

    public String getQuestion() {
        return question;
    }
    public void setQuestion(String question) {
        this.question = question;
    }
    public String getAnswer() {
        return answer;
    }
    public Integer getConversationId() {
        return conversationId;
    }
    public void setConversationId(Integer conversationId) {
        this.conversationId = conversationId;
    }
    public void setAnswer(String response) {
        this.answer = response;
    }
    public String getUser() {
        return user;
    }
    public void setUser(String username) {
        this.user = username;
    }
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
}
