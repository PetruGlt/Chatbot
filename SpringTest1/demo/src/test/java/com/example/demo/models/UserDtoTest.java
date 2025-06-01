package com.example.demo.models;
import com.example.demo.models.UserDto;
import com.example.demo.utils.AccessLevel;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserDtoTest {

    @Test
    void testSetAndGetUsername() {
        UserDto dto = new UserDto();
        dto.setUsername("maria");
        assertEquals("maria", dto.getUsername());
    }

    @Test
    void testSetAndGetPassword() {
        UserDto dto = new UserDto();
        dto.setPassword("parola123");
        assertEquals("parola123", dto.getPassword());
    }

    @Test
    void testAccessAlwaysReturnsUSER() {
        UserDto dto = new UserDto();
        dto.setAccess("EXPERT");
        assertEquals(AccessLevel.USER, dto.getAccess());
    }
}
