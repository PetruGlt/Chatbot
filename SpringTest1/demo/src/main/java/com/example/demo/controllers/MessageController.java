package com.example.demo.controllers;

import com.example.demo.services.MessageService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class MessageController {

    public final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping("/ask")
    @ResponseBody
    public String sendMessage(
            @RequestParam("question") String question,
            @RequestParam("username") String username,
            @RequestParam("conversationId") String conversationId) {


        return messageService.sendQuestion(question);
    }




}