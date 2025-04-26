package com.example.demo.controllers;

import com.example.demo.models.QuestionObject;
import com.example.demo.services.MessageService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Map;

@Controller
public class MessageController {

    public final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping("/ask")
    @ResponseBody//Frontul trimite si asteapta JSON
    public Map<String, String> sendMessage(@RequestBody QuestionObject dto) {
        String answer = messageService.sendQuestion(dto.question, dto.username);
        // Returnam un obiect Json: { "answer": "Hello!" }
        return Map.of("answer", answer);
    }
//    public String sendMessage(
//            @RequestParam("question") String question,
//            @RequestParam("username") String username,
//            @RequestParam("conversationId") String conversationId) {
//
//
//        return messageService.sendQuestion(question, username);
//    }



}