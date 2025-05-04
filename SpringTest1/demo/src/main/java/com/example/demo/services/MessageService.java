package com.example.demo.services;

import com.example.demo.models.Conversation;
import com.example.demo.repositories.ConversationRepository;
import com.example.demo.utils.ConversationSummaryDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriUtils;

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

    public String sendQuestion(String question, String username, Integer conversationId) {
        // Trimite întrebarea la API
    /*    String encoded = UriUtils.encodeQueryParam(question, StandardCharsets.UTF_8);
        String uri = "/chatbot/ask?question=" + encoded;

        return webClient.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }*/
        // Trimite un raspuns
        String response = responseService.getResponse();


        Conversation conversation = new Conversation();
        conversation.setQuestion(question);
        conversation.setAnswer(response);
        conversation.setConversationId(conversationId);
        conversation.setUser(username);
        conversationRepository.save(conversation);

        return response;

    }

    // functie care preia din tabela messajele cu conversationId
    public List<ConversationSummaryDTO> getConversations(String username) {
        return conversationRepository.findFirstQuestionAndAnswerPerConversation(username);
    }
}
