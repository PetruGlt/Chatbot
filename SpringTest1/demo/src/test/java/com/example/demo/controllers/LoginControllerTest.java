package com.example.demo.controllers;

import com.example.demo.services.AuthService;
import com.example.demo.services.RedirectService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.web.servlet.view.RedirectView;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class LoginControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuthService authService;

    @Autowired
    private RedirectService redirectService;

    @TestConfiguration
    static class MockConfig {

        @Bean
        AuthService authService() {
            return mock(AuthService.class);
        }

        @Bean
        RedirectService redirectService() {
            return mock(RedirectService.class);
        }
    }

    // Test pentru redirecționarea la /main
    @Test
    void whenValidCredentials_thenRedirectToMain() throws Exception {
        String credentials = "Basic dXNlcjpwYXNz";

        when(authService.authenticate(credentials)).thenReturn(Boolean.TRUE);
        when(redirectService.redirectLogin(credentials)).thenReturn(new RedirectView("/main"));

        mockMvc.perform(post("/login")
                        .header("Authorization", credentials))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/main"));
    }

    // Test pentru redirecționarea la /mainExpert
    @Test
    void whenValidCredentialsForExpert_thenRedirectToMainExpert() throws Exception {
        String credentials = "Basic ZXhwZXJ0OmV4cGVydA==";

        when(authService.authenticate(credentials)).thenReturn(Boolean.TRUE);
        when(redirectService.redirectLogin(credentials)).thenReturn(new RedirectView("/mainExpert"));

        mockMvc.perform(post("/login")
                        .header("Authorization", credentials))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/mainExpert"));
    }

    // Test pentru când credentialele sunt invalide
    @Test
    void whenInvalidCredentials_thenRedirectToLoginWithError() throws Exception {
        String credentials = "Basic aW52YWxpZDppbnZhbGlk";

        when(authService.authenticate(credentials)).thenReturn(Boolean.FALSE);

        mockMvc.perform(post("/login")
                        .header("Authorization", credentials))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login?error=true"));
    }

    @Test
    void testShowLoginPage() throws Exception {
        mockMvc.perform(get("/login"))
                .andExpect(status().isOk())
                .andExpect(view().name("client"));
    }

    @Test
    void testShowMainPage() throws Exception {
        mockMvc.perform(get("/main"))
                .andExpect(status().isOk())
                .andExpect(view().name("MainPage"));
    }

    @Test
    void testShowMainExpertPage() throws Exception {
        mockMvc.perform(get("/mainExpert"))
                .andExpect(status().isOk())
                .andExpect(view().name("mainPageExpert"));
    }

    @Test
    void testClientPage() throws Exception {
        mockMvc.perform(get("/client"))
                .andExpect(status().isOk())
                .andExpect(view().name("client"));
    }

    @Test
    void testExpertPage() throws Exception {
        mockMvc.perform(get("/expert"))
                .andExpect(status().isOk())
                .andExpect(view().name("expert"));
    }
}
