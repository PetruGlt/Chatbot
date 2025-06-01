package com.example.demo.controllers;

import com.example.demo.models.Conversation;
import com.example.demo.services.MessageService;
import com.example.demo.utils.ConversationSummaryDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.equalTo;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest
@ContextConfiguration(classes = MessageControllerTest.TestConfig.class)
class MessageControllerTest {

    @Configuration
    static class TestConfig {
        @Bean
        public MessageController messageController() {
            return new MessageController(mockMessageService());
        }

        @Bean
        public MessageService mockMessageService() {
            return mock(MessageService.class);
        }

        @Bean
        public ObjectMapper objectMapper() {
            return new ObjectMapper();
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MessageService messageService;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setup() {
        when(messageService.sendQuestion(any(Integer.class), any(String.class), any(String.class))).thenReturn("Mock answer");
        when(messageService.saveConversation(any(Conversation.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void testSendMessage() throws Exception {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("username", "testUser");
        requestBody.put("question", "Test question");
        requestBody.put("conversationId", Integer.valueOf(123));

        mockMvc.perform(post("/chatbot/ask")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer", equalTo("Mock answer")));
    }

    @Test
    void testGetChatHistory() throws Exception {
        List<ConversationSummaryDTO> mockConversations = new ArrayList<>();
        mockConversations.add(new ConversationSummaryDTO(Integer.valueOf(1), "First question", "First answer"));
        mockConversations.add(new ConversationSummaryDTO(Integer.valueOf(2), "Second question", "Second answer"));

        when(messageService.getConversations("testUser")).thenReturn(mockConversations);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("username", "testUser");

        mockMvc.perform(post("/chatHistory")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].conversationId", equalTo(1)))
                .andExpect(jsonPath("$[0].firstQuestion", equalTo("First question")))
                .andExpect(jsonPath("$[1].conversationId", equalTo(2)));
    }

    @Test
    void testGetUncheckedQuestions() throws Exception {
        List<Conversation> uncheckedQuestions = new ArrayList<>();

        Conversation q1 = new Conversation();
        q1.setId(Long.valueOf(1));
        q1.setQuestion("Unchecked question 1");
        q1.setUser("user1");
        q1.setConversationId(Integer.valueOf(101));
        q1.setChecked(Boolean.FALSE);
        q1.setAnswer("Answer 1");

        Conversation q2 = new Conversation();
        q2.setId(Long.valueOf(2));
        q2.setQuestion("Unchecked question 2");
        q2.setUser("user2");
        q2.setConversationId(Integer.valueOf(102));
        q2.setChecked(Boolean.FALSE);
        q2.setAnswer("Answer 2");

        uncheckedQuestions.add(q1);
        uncheckedQuestions.add(q2);

        when(messageService.getUncheckedQuestions()).thenReturn(uncheckedQuestions);

        mockMvc.perform(post("/questions")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id", equalTo(1)))
                .andExpect(jsonPath("$[0].question", equalTo("Unchecked question 1")))
                .andExpect(jsonPath("$[1].conversationId", equalTo(102)));
    }

    @Test
    void testShowMainPage() throws Exception {
        mockMvc.perform(get("/mainPageClient"))
                .andExpect(status().isOk())
                .andExpect(view().name("MainPage"));
    }

    @Test
    void testShowHistory() throws Exception {
        mockMvc.perform(get("/showHistory"))
                .andExpect(status().isOk())
                .andExpect(view().name("historyPage"));
    }

    @Test
    void testMarkQuestionAsChecked() throws Exception {
        Conversation conversation = new Conversation();
        conversation.setId(1L);
        conversation.setChecked(false);

        when(messageService.getConversationById(1L)).thenReturn(conversation);
        when(messageService.saveConversation(any(Conversation.class))).thenReturn(conversation);

        mockMvc.perform(post("/questions/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", equalTo("Question marked as checked")));
    }

    @Test
    void testMarkQuestionAsChecked_notFound() throws Exception {
        when(messageService.getConversationById(999L)).thenReturn(null);

        mockMvc.perform(post("/questions/999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", equalTo("Conversation not found")));
    }

    @Test
    void testUpdateExpertAnswer_conversationNotFound() throws Exception {
        when(messageService.getConversationById(999L)).thenReturn(null);

        Map<String, Object> payload = new HashMap<>();
        payload.put("id", 999L);
        payload.put("updatedAnswer", "Nou răspuns");
        payload.put("username", "testUser");

        mockMvc.perform(post("/qa/updateAnswer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", equalTo(false)))
                .andExpect(jsonPath("$.message", equalTo("Conversation not found")));
    }

    @Test
    void testCheckValidatedMessages() throws Exception {
        List<Conversation> validated = new ArrayList<>();
        Conversation c = new Conversation();
        c.setId(1L);
        c.setUser("user1");
        c.setConversationId(123);
        c.setQuestion("Q");
        c.setAnswer("A");
        c.setChecked(true);
        validated.add(c);

        when(messageService.getValidatedMessages("user1", 123)).thenReturn(validated);

        Map<String, Object> payload = new HashMap<>();
        payload.put("username", "user1");
        payload.put("conversationId", 123);

        mockMvc.perform(post("/checkValidatedMessages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].validation", equalTo("1")));
    }




    @Test
    void testUpdateExpertAnswer() throws Exception {
        Conversation conversation = new Conversation();
        conversation.setId(1L);
        when(messageService.getConversationById(1L)).thenReturn(conversation);

        Map<String, Object> payload = new HashMap<>();
        payload.put("id", 1L);
        payload.put("updatedAnswer", "Updated test answer");
        payload.put("username", "testUser");

        mockMvc.perform(post("/qa/updateAnswer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", equalTo(true)))
                .andExpect(jsonPath("$.message", equalTo("Answer updated and validated!")));
    }


}
