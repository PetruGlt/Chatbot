package com.example.demo.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(MockitoExtension.class)
public class ResponseServiceTest {

    private ResponseService responseService;

    @BeforeEach
    void setUp() {
        responseService = new ResponseService();
    }

    @Test
    void getResponse_shouldReturnCorrectMessage() {
        String response = responseService.getResponse();

        assertNotNull(response, "Răspunsul nu ar trebui să fie null");
        assertEquals("Hello, it's me!", response, "Răspunsul ar trebui să fie exact mesajul așteptat");
    }

    @Test
    void getResponse_shouldReturnSameMessageOnMultipleCalls() {
        String firstResponse = responseService.getResponse();
        String secondResponse = responseService.getResponse();

        assertEquals(firstResponse, secondResponse, "Răspunsul ar trebui să fie identic la apeluri multiple");
    }
}