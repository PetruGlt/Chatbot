package com.example.demo.models;

import com.example.demo.utils.AccessLevel;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class UserTest {

    @Test
    void testSetAndGetUsername() {
        User user = new User();
        user.setUsername("test");
        assertEquals("test", user.getUsername());
    }

    @Test
    void testSetAndGetPassword() {
        User user = new User();
        user.setPassword("secret");
        assertEquals("secret", user.getPassword());
    }

    @Test
    void testSetAndGetAccess() {
        User user = new User();
        user.setAccess(AccessLevel.EXPERT);
        assertEquals(AccessLevel.EXPERT, user.getAccess());
    }

    @Test
    void testToString() {
        User user = new User();
        user.setUsername("alex");
        user.setPassword("parola");
        assertTrue(user.toString().contains("alex"));
    }
}
