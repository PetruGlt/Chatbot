package com.example.demo.services;

import com.example.demo.models.Conversation;
import com.example.demo.repositories.ConversationRepository;
import com.example.demo.services.MessageService;
import com.example.demo.services.ResponseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(MockitoExtension.class)
public class MessageServiceTest {

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private ResponseService responseService;

    private MessageService messageService;

    @BeforeEach
    void setUp() {
        messageService = new MessageService(conversationRepository, responseService);
    }

    @Test
    void testSendQuestionReturnsTestString() {
        Integer conversationId = 1;
        String prompt = "test";
        String username = "user1";
        String result = messageService.sendQuestion(conversationId, prompt, username);
        assertNotNull(result);
    }

    @Test
    void testSaveConversation() {
        Conversation conversation = new Conversation();
        Mockito.when(conversationRepository.save(conversation)).thenReturn(conversation);

        Conversation result = messageService.saveConversation(conversation);
        assertEquals(conversation, result);
    }

    @Test
    void testGetConversationById() {
        Conversation conversation = new Conversation();
        conversation.setId(1L);

        Mockito.when(conversationRepository.findById(1L)).thenReturn(Optional.of(conversation));

        Conversation result = messageService.getConversationById(1L);
        assertEquals(1L, result.getId());
    }

    @Test
    void testGetUncheckedQuestions() {
        List<Conversation> mockList = List.of(new Conversation(), new Conversation());
        Mockito.when(conversationRepository.findByCheckedFalse()).thenReturn(mockList);

        List<Conversation> result = messageService.getUncheckedQuestions();
        assertEquals(2, result.size());
    }

    @Test
    void testGetValidatedMessages() {
        String username = "testUser";
        int conversationId = 1;

        List<Conversation> mockList = List.of(new Conversation());
        Mockito.when(conversationRepository.findByUserAndConversationIdAndCheckedTrue(username, conversationId))
                .thenReturn(mockList);

        List<Conversation> result = messageService.getValidatedMessages(username, conversationId);
        assertEquals(1, result.size());
    }

    @Test
    void testGetMaxConversationIdByUser() {
        Mockito.when(conversationRepository.findMaxConversationIdByUser("john"))
                .thenReturn(5);

        Integer result = messageService.getMaxConversationIdByUser("john");
        assertEquals(5, result);
    }


}
