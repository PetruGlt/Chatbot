package com.example.demo.models;

import com.example.demo.utils.AccessLevel;

import static com.example.demo.utils.AccessLevel.USER;

/**
 * Data Transfer Object (DTO) for user registration.
 */
public class UserDto {
    private String username;
    private String password;
    private AccessLevel access;

    // Getter for username
    public String getUsername() {
        return username;
    }
    public AccessLevel getAccess(){
        return USER;
    }
    public void setAccess(String access){
        this.access = AccessLevel.valueOf(access);
    }

    // Setter for username
    public void setUsername(String username) {
        this.username = username;
    }

    // Getter for password
    public String getPassword() {
        return password;
    }

    // Setter for password
    public void setPassword(String password) {
        this.password = password;
    }
}