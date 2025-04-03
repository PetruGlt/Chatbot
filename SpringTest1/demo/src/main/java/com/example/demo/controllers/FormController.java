package com.example.demo.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class FormController {

    // Show the form page
    @GetMapping("/form")
    public String showForm() {
        return "form";  // Returns form.html
    }

    // Handle form submission
    @PostMapping("/submit")
    public String submitForm(@RequestParam String name, Model model) {
        model.addAttribute("name", name);
        return "result";  // Returns result.html
    }
}