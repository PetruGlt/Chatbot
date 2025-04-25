package com.example.demo.services;

import com.example.demo.models.Conversation;
import com.example.demo.repositories.ConversationRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriUtils;

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

    public String sendQuestion(String question, String username) {
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

        // salvare mysql
        Conversation conversation = new Conversation();
        conversation.setQuestion(question);
        conversation.setResponse(response);
        conversation.setUsername(username);
        conversationRepository.save(conversation);

        return response;

    }
}
