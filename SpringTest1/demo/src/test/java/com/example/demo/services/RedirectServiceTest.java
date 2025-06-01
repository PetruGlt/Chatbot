package com.example.demo.services;

import com.example.demo.models.User;
import com.example.demo.repositories.UserRepository;
import com.example.demo.utils.AccessLevel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.view.RedirectView;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RedirectServiceTest {

    private UserRepository userRepository;
    private RedirectService redirectService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        redirectService = new RedirectService(userRepository);
    }

    @Test
    void testRedirect_userFound_userAccess() {
        User user = new User();
        user.setUsername("ana");
        user.setAccess(AccessLevel.USER);

        String auth = "Basic " + base64("ana:pass");

        when(userRepository.findByUsername("ana")).thenReturn(user);

        RedirectView view = redirectService.redirectLogin(auth);
        assertEquals("/main", view.getUrl());
    }

    @Test
    void testRedirect_userFound_expertAccess() {
        User user = new User();
        user.setUsername("expert");
        user.setAccess(AccessLevel.EXPERT);

        String auth = "Basic " + base64("expert:secret");
        when(userRepository.findByUsername("expert")).thenReturn(user);
        RedirectView view = redirectService.redirectLogin(auth);
        assertEquals("/mainExpert", view.getUrl());
    }

    @Test
    void testRedirect_userNotFound() {
        String auth = "Basic " + base64("ana1:nopass");

        when(userRepository.findByUsername("ana1")).thenReturn(null);

        RedirectView view = redirectService.redirectLogin(auth);
        assertEquals("/login?error=user_not_found", view.getUrl());
    }

    private String base64(String raw) {
        return java.util.Base64.getEncoder().encodeToString(raw.getBytes());
    }
}
