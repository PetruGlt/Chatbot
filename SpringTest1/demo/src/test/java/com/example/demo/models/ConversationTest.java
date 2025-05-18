package com.example.demo.models;

import com.example.demo.models.Conversation;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ConversationTest {

    @Test
    void testSetAndGetFields() {
        Conversation conv = new Conversation();
        conv.setUser("ana");
        conv.setConversationId(1);
        conv.setQuestion("Cum pot aplica pentru un credit?");
        conv.setAnswer("Acceseaza sectiunea CREDITE din aplicatie");
        conv.setUpdatedResponse("Actualizat");
        conv.setChecked(true);

        assertEquals("ana", conv.getUser());
        assertEquals(1, conv.getConversationId());
        assertEquals("Cum pot aplica pentru un credit?", conv.getQuestion());
        assertEquals("Acceseaza sectiunea CREDITE din aplicatie", conv.getAnswer());
        assertEquals("Actualizat", conv.getUpdatedResponse());
        assertTrue(conv.getChecked());
    }

    @Test
    void testToStringContainsFields() {
        Conversation conv = new Conversation();
        conv.setUser("alex");
        conv.setConversationId(2);
        conv.setQuestion("Salut?");
        conv.setAnswer("Salut!");

        String str = conv.toString();
        assertTrue(str.contains("alex"));
        assertTrue(str.contains("Salut?"));
    }
}
