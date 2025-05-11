package com.example.demo.controllers;

import com.example.demo.models.User;
import com.example.demo.models.UserDto;
import com.example.demo.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class RegistrationController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(@RequestBody UserDto userDto) {
        Map<String, Object> response = new HashMap<>();

        if (userRepository.existsByUsername(userDto.getUsername())) {
            response.put("success", false);
            response.put("message", "Username-ul este deja luat!.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        User user = new User();
        user.setUsername(userDto.getUsername());
        user.setPassword(userDto.getPassword()); 
        user.setAccess(userDto.getAccess());
        userRepository.save(user);

        response.put("success", true);
        response.put("message", "Cont creat cu succes!");
        response.put("redirectUrl", "/client");
        return ResponseEntity.ok(response);
    }
}