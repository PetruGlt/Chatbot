package com.example.demo.services;

import com.example.demo.models.User;
import com.example.demo.repositories.UserRepository;
import org.apache.tomcat.util.codec.binary.Base64;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    private AuthService authService;

    private static final String USERNAME = "testuser";
    private static final String PASSWORD = "password123";
    private static final String VALID_AUTH_HEADER = "Basic " +
            Base64.encodeBase64String((USERNAME + ":" + PASSWORD).getBytes());

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository);
    }

    @Test
    void authenticate_withValidCredentials_returnsTrue() {
        User mockUser = new User();
        mockUser.setUsername(USERNAME);
        mockUser.setPassword(PASSWORD);

        when(userRepository.findByUsername(USERNAME)).thenReturn(mockUser);

        boolean result = authService.authenticate(VALID_AUTH_HEADER);

        assertTrue(result);
        verify(userRepository).findByUsername(USERNAME);
    }

    @Test
    void authenticate_withInvalidPassword_returnsFalse() {
        User mockUser = new User();
        mockUser.setUsername(USERNAME);
        mockUser.setPassword("altaparola");

        when(userRepository.findByUsername(USERNAME)).thenReturn(mockUser);


        boolean result = authService.authenticate(VALID_AUTH_HEADER);

        assertFalse(result);
        verify(userRepository).findByUsername(USERNAME);
    }

    @Test
    void authenticate_withNonexistentUser_returnsFalse() {
        when(userRepository.findByUsername(USERNAME)).thenReturn(null);

        boolean result = authService.authenticate(VALID_AUTH_HEADER);

        assertFalse(result);
        verify(userRepository).findByUsername(USERNAME);
    }

    @Test
    void authenticate_withNullAuthHeader_returnsFalse() {
        boolean result = authService.authenticate(null);

        assertFalse(result);
        verifyNoInteractions(userRepository);
    }

    @Test
    void authenticate_withInvalidAuthHeaderFormat_returnsFalse() {
        boolean result = authService.authenticate("Bearer token");

        assertFalse(result);
        verifyNoInteractions(userRepository);
    }



    @Test
    void authenticate_withMissingPassword_returnsFalse() {
        // Arrange
        String invalidHeader = "Basic " +
                Base64.encodeBase64String(USERNAME.getBytes());

        // Act
        boolean result = authService.authenticate(invalidHeader);

        // Assert
        assertFalse(result);
        verifyNoInteractions(userRepository);
    }
}
