package com.example.demo.controllers;

import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import com.example.demo.services.MessageService;

@Controller
public class StatisticsController {

    public final MessageService messageService;

    public StatisticsController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping("/statistics")
    @ResponseBody
    public Map<String, Long> sendMessage() {
        return messageService.getStatistics();
    }
}
