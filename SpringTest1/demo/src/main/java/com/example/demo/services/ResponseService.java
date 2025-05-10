package com.example.demo.services;
import org.springframework.stereotype.Service;

@Service
public class ResponseService {
    public String getResponse(){
        return "Hello, it's me!";
    }
}
