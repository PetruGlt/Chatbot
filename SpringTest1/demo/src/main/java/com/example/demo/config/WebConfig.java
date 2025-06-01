package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        
        registry.addMapping("/**")  
                .allowedOrigins("https://fii2e1.online")  
                .allowedMethods("GET", "POST", "PUT", "DELETE")  
                .allowedHeaders("Origin", "Content-Type", "Authorization")  
                .allowCredentials(true)
                .maxAge(3600); 
    }
}
