package com.example.demo.services;

import com.example.demo.models.Conversation;
import com.example.demo.repositories.ConversationRepository;
import com.example.demo.utils.ConversationSummaryDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriUtils;
import java.util.*;
import java.util.List;
import java.util.Random;

@Service
public class MessageService {

    private final WebClient webClient;
    private final ConversationRepository conversationRepository;
    private final ResponseService responseService;

    public MessageService(ConversationRepository conversationRepository, ResponseService responseService) {
        this.conversationRepository = conversationRepository;
        this.responseService = responseService;
        this.webClient = WebClient.create("http://localhost:3000"); // baza URL
    }

    public String sendQuestion(Integer conversationId) {
        // Trimite întrebarea la API
        Map<String, Integer> aiRequest = Map.of("conversationId", conversationId);
    //   String encoded = UriUtils.encodeQueryParam(question, StandardCharsets.UTF_8);
      //  String uri = "/chatbot/ask?question=" + encoded;

      /*  return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/chatbot/ask")
                        .queryParam("conversationId", conversationId)
                        .build())
                .retrieve()
                .bodyToMono(String.class)
                .block();
*/
        // Trimite un raspuns
        String response = "test";
        return response;
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

}
