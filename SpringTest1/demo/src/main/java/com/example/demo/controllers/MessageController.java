package com.example.demo.controllers;

import com.example.demo.models.Conversation;
import com.example.demo.models.QuestionObject;
import com.example.demo.models.User;
import com.example.demo.repositories.UserRepository;
import com.example.demo.services.MessageService;
import com.example.demo.utils.ConversationSummaryDTO;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class MessageController {
    UserRepository userRepository;

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
    public List<Map<String, Object>>  getChatHistory(@RequestBody Map<String, String> requestBody) { // conversationId este introdus in query
        // url example : /chat-history?conversationId=1

        String username = requestBody.get("username");

        // preluam toate messajele cu conversationId
        List<ConversationSummaryDTO> conversationList = messageService.getConversations(username);

        // construim o lista cu obiecte de tip json
        List<Map<String, Object>> chatList = new ArrayList<>();
        for (ConversationSummaryDTO dto : conversationList) {
            Map<String, Object> chatEntry = new HashMap<>();
            chatEntry.put("conversationId", dto.getConversationId());
            chatEntry.put("firstQuestion", dto.getFirstQuestion());
            chatEntry.put("firstAnswer", dto.getFirstAnswer());
            chatList.add(chatEntry);
        }

        return chatList;
    }

    @PostMapping("/questions")
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