package com.example.demo.controllers;

import com.example.demo.models.Conversation;
import com.example.demo.models.QuestionObject;
import com.example.demo.services.MessageService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
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
        String answer = messageService.sendQuestion(dto.question, dto.username, dto.conversationId);
        // Returnam un obiect Json: { "answer": "Hello!" }
        return Map.of("answer", answer);
    }

    @GetMapping("/showHistory")
    public String showHistory() {
        return "historyPage";
    }


    @GetMapping("/mainPageClient")
    public String showMainPage() {
        return "MainPage";
    }

    @PostMapping("/chatHistory")
    @ResponseBody
    public Map<String, List<Map<String, Object>>> getChatHistory(@RequestParam Integer conversationId) { // conversationId este introdus in query
        // url example : /chat-history?conversationId=1

        // preluam toate messajele cu conversationId
        List<Conversation> conversationList = messageService.getConversations(conversationId);

        // construim o lista cu obiecte de tip json
        List<Map<String, Object>> chatList = new ArrayList<>();
        for (Conversation conversation : conversationList) {
            Map<String, Object> chatEntry = new HashMap<>();
            chatEntry.put("conversationId", conversation.getConversationId());
            chatEntry.put("question", conversation.getQuestion());
            chatEntry.put("answer", conversation.getAnswer());
            chatList.add(chatEntry);
        }

        System.out.println(conversationList);
        return Map.of("chatHistory", chatList);
    }

    @GetMapping("/questions")
    @ResponseBody
    public List<Map<String, Object>> getUncheckedQuestions() {
        List<Conversation> unchecked = messageService.getUncheckedQuestions();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Conversation c : unchecked) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("question", c.getQuestion());
            map.put("user", c.getUser());
            map.put("conversationId", c.getConversationId());
            result.add(map);
        }

        return result;
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