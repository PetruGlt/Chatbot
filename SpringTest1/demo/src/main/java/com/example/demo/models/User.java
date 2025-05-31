package com.example.demo.models;

import jakarta.persistence.*;

import com.example.demo.utils.AccessLevel;
/**
 * Modelul User reprezintă un utilizator în baza de date.
 */




@Table(name = "users")
@Entity
public class User {
    @Id
    @Column(unique = true, nullable = false)
    private String username; // Username-ul utilizatorului (cheie primară)
    @Column(nullable = false)
    private String password; // Parola utilizatorului (ar trebui să fie stocată criptat, ex: BCrypt)

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('USER','ADMIN', 'EXPERT')")
    private AccessLevel access;

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

    public AccessLevel getAccess() {
        return access;
    }

    public void setAccess(AccessLevel access) {
        this.access = access;
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
