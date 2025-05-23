package com.example.demo.services;

import com.example.demo.models.ChatbotResponse;
import com.example.demo.models.Conversation;
import com.example.demo.repositories.ConversationRepository;
import com.example.demo.utils.ConversationSummaryDTO;
import org.springframework.stereotype.Service;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import java.util.*;
import java.util.List;

@Service
public class MessageService {
    private final ConversationRepository conversationRepository;
    private final ResponseService responseService;

    public MessageService(ConversationRepository conversationRepository, ResponseService responseService) {
        this.conversationRepository = conversationRepository;
        this.responseService = responseService;
    }

    public String sendQuestion(Integer conversationId, String prompt) {
        String url = "http://localhost:3000/chatbot/ask";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("conversationId", conversationId);
        requestBody.put("prompt", prompt);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<ChatbotResponse> response = restTemplate.postForEntity(url, requestEntity, ChatbotResponse.class);

        return response.getBody().getAnswer();
    }

    public Conversation saveConversation(Conversation conversation) {
        return conversationRepository.save(conversation);
    }

    // functie care preia din tabela messajele cu conversationId
    public List<ConversationSummaryDTO> getConversations(String username) {
        return conversationRepository.findFirstQuestionAndAnswerPerConversation(username);
    }

    // fuctie care ia intrebarile care au "checked" = false
    public List<Conversation> getUncheckedQuestions() {
        return conversationRepository.findByCheckedFalse();
    }

    // functie care preia questoin cu id = id
    public Conversation getConversationById(Long id) {
        return conversationRepository.findById(id).orElse(null);
    }

    public List<Conversation> getValidatedMessages(String username, Integer conversationId) {
        return conversationRepository.findByUserAndConversationIdAndCheckedTrue(username, conversationId);
    }


    public Integer getMaxConversationIdByUser(String username) {
        return conversationRepository.findMaxConversationIdByUser(username);
    }
}
