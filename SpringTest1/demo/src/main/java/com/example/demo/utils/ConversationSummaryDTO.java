package com.example.demo.utils;

public class ConversationSummaryDTO {
    private Integer conversationId;
    private String firstQuestion;
    private String firstAnswer;

    public ConversationSummaryDTO(Integer conversationId, String firstQuestion, String firstAnswer) {
        this.conversationId = conversationId;
        this.firstQuestion = firstQuestion;
        this.firstAnswer = firstAnswer;
    }
    public Integer getConversationId() {
        return conversationId;
    }

    public void setConversationId(Integer conversationId) {
        this.conversationId = conversationId;
    }

    public String getFirstQuestion() {
        return firstQuestion;
    }

    public void setFirstQuestion(String firstQuestion) {
        this.firstQuestion = firstQuestion;
    }

    public String getFirstAnswer() {
        return firstAnswer;
    }

    public void setFirstAnswer(String firstAnswer) {
        this.firstAnswer = firstAnswer;
    }
}
