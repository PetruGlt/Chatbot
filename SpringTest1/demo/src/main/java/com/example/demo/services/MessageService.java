package com.example.demo.services;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;

@Service
public class MessageService {

    private final WebClient webClient;

    public MessageService() {
        this.webClient = WebClient.create("http://localhost:3000"); // baza URL
    }

    public String sendQuestion(String question) {
        String encoded = UriUtils.encodeQueryParam(question, StandardCharsets.UTF_8);
        String uri = "/chatbot/ask?question=" + encoded;

        return webClient.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

}
