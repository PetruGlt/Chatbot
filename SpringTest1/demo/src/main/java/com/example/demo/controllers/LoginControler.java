package com.example.demo.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Controller
public class LoginControler {
    @GetMapping("/login")
    public String showLogin() {return "client";}

    @PostMapping("/login")
    public String processLogin() {
        // Logica de autentificare
        return "redirect:/main";  // Redirecționează la /main după login
    }

    @GetMapping("/main")
    public String showMainPage() {
        return "MainPage";  // Aceasta va reda MainPage.html
    }

    @GetMapping("/client")
    public String client() {
        return "client";
    }

    @GetMapping("/expert")
    public String expert() {
        return "expert";
    }
}
