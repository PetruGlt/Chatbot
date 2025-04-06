package com.example.demo.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Modelul User reprezintă un utilizator în baza de date.
 */
@Table(name = "users")
@Entity
public class User {
    @Id
    private String username; // Username-ul utilizatorului (cheie primară)

    private String password; // Parola utilizatorului (ar trebui să fie stocată criptat, ex: BCrypt)

    // Getter pentru parola utilizatorului
    public String getPassword() {
        return password;
    }

    // Setter pentru parola utilizatorului
    public void setPassword(String password) {
        this.password = password;
    }

    // Getter pentru username
    public String getUsername() {
        return username;
    }

    // Setter pentru username
    public void setUsername(String username) {
        this.username = username;
    }

    // Metodă pentru afișarea informațiilor despre utilizator (debugging/logging)
    @Override
    public String toString() {
        return "User{" +
                "username='" + username + '\'' +
                ", password='" + password + '\'' +
                '}';
    }
}
