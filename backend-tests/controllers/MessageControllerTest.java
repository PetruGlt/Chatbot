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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
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
        // Reset and configure mocks before each test
        when(messageService.sendQuestion(anyInt())).thenReturn("Mock answer");
        when(messageService.saveConversation(any(Conversation.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void testSendMessage() throws Exception {
        // Create request body
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("username", "testUser");
        requestBody.put("question", "Test question");
        requestBody.put("conversationId", 123);

        // Execute and verify
        mockMvc.perform(post("/chatbot/ask")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer").value("Mock answer"));
    }

    @Test
    void testGetChatHistory() throws Exception {
        // Setup mock data
        List<ConversationSummaryDTO> mockConversations = new ArrayList<>();
        mockConversations.add(new ConversationSummaryDTO(1, "First question", "First answer"));
        mockConversations.add(new ConversationSummaryDTO(2, "Second question", "Second answer"));

        when(messageService.getConversations("testUser")).thenReturn(mockConversations);

        // Create request body
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("username", "testUser");

        // Execute and verify
        mockMvc.perform(post("/chatHistory")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].conversationId").value(1))
                .andExpect(jsonPath("$[0].firstQuestion").value("First question"))
                .andExpect(jsonPath("$[1].conversationId").value(2));
    }

    @Test
    void testGetUncheckedQuestions() throws Exception {
        // Setup mock data
        List<Conversation> uncheckedQuestions = new ArrayList<>();

        Conversation q1 = new Conversation();
        q1.setId(1L);
        q1.setQuestion("Unchecked question 1");
        q1.setUser("user1");
        q1.setConversationId(101);
        q1.setChecked(false);

        Conversation q2 = new Conversation();
        q2.setId(2L);
        q2.setQuestion("Unchecked question 2");
        q2.setUser("user2");
        q2.setConversationId(102);
        q2.setChecked(false);

        uncheckedQuestions.add(q1);
        uncheckedQuestions.add(q2);

        when(messageService.getUncheckedQuestions()).thenReturn(uncheckedQuestions);

        // Execute and verify
        mockMvc.perform(post("/questions")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].question").value("Unchecked question 1"))
                .andExpect(jsonPath("$[1].conversationId").value(102));
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
}