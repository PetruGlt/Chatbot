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

    @PostMapping("/chatbot/ask")
    @ResponseBody//Frontul trimite si asteapta JSON
    public Map<String, String> sendMessage(@RequestBody QuestionObject dto) {

        String answer = messageService.sendQuestion(dto.conversationId, dto.question);
      Conversation conversation = new Conversation();
      conversation.setUser(dto.username);
      conversation.setQuestion(dto.question);
      conversation.setConversationId(dto.conversationId);
      conversation.setChecked(false);
      conversation.setAnswer(answer);

      messageService.saveConversation(conversation);

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
            map.put("answer", c.getAnswer());
            map.put("user", c.getUser());
            map.put("conversationId", c.getConversationId());
            result.add(map);
        }

        return result;
    }

    @PostMapping("/questions/{questionID}")
    @ResponseBody
    public Map<String, String> markQuestionAsChecked(@PathVariable Long questionID){
        Conversation conversation = messageService.getConversationById(questionID);
        if(conversation == null){
            return Map.of("message", "Conversation not found");
        }

        conversation.setChecked(true);
        messageService.saveConversation(conversation);

        return Map.of("message", "Question marked as checked");
    }

    @PostMapping("/qa/updateAnswer")
    @ResponseBody
    public Map<String, Object> updateExpertAnswer(@RequestBody Map<String, Object> payload) {
        Long questionId = Long.valueOf(payload.get("id").toString());
        String updatedAnswer = payload.get("updatedAnswer").toString();
        String username = payload.get("username").toString();

        Conversation conversation = messageService.getConversationById(questionId);
        if (conversation == null) {
            return Map.of("success", false, "message", "Conversation not found");
        }

        conversation.setUpdatedResponse(updatedAnswer);
        conversation.setChecked(true);
        messageService.saveConversation(conversation);

        return Map.of("success", true, "message", "Answer updated and validated!");
    }


    @PostMapping("/checkValidatedMessages")
    @ResponseBody
    public List<Map<String, Object>> checkValidatedMessages(@RequestBody Map<String, Object> payload) {
        String username = payload.get("username").toString();
        Integer conversationId = Integer.valueOf(payload.get("conversationId").toString());

        List<Conversation> validated = messageService.getValidatedMessages(username, conversationId);


        List<Map<String, Object>> result = new ArrayList<>();
        for (Conversation c : validated) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("question", c.getQuestion());
            map.put("answer", c.getAnswer());
            map.put("validation", c.getChecked() ? "1" : "0");
            result.add(map);
        }
        return result;
    }

    @PostMapping("/get-latest-onversationID")
    @ResponseBody
    public Map<String, Object> getLastConversationId(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        Integer lastConversationId = messageService.getMaxConversationIdByUser(username);
        return Map.of(
                "username", username,
                "lastConversationId", lastConversationId != null ? lastConversationId : 0
        );
    }


    @GetMapping("/get-messages")
    @ResponseBody
    public List<Map<String, Object>> getMessages(@RequestParam Integer conversationId) {
        List<Conversation> messages = messageService.getMessagesByConversation(conversationId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Conversation c : messages) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("question", c.getQuestion());
            map.put("answer", c.getAnswer());
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