package com.example.demo.services;

import com.example.demo.models.User;
import com.example.demo.repositories.UserRepository;
import org.apache.tomcat.util.codec.binary.Base64;
import org.springframework.stereotype.Service;

/**
 * Serviciu responsabil pentru logica de autentificare a utilizatorilor.
 */
@Service
public class AuthService {
    private final UserRepository userRepository;

    /**
     * Constructor ce injectează UserRepository pentru accesul la utilizatori.
     * @param userRepository repository-ul pentru entitatea User
     */
    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Autentifică un utilizator pe baza antetului Authorization primit.
     *
     * @param authorizationHeader antetul Authorization în format "Basic base64(username:password)"
     * @return true dacă autentificarea este validă, altfel false
     */
    public boolean authenticate(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Basic ")) {
            return false;
        }

        // Extrage și decodează credențialele din antet
        String base64Credentials = authorizationHeader.substring("Basic ".length());
        String credentials = new String(Base64.decodeBase64(base64Credentials));
        String[] values = credentials.split(":", 2);

        // Verifică dacă formatul este corect
        if (values.length != 2) {
            return false;
        }

        String username = values[0];
        String password = values[1];

        // Caută utilizatorul în baza de date și verifică parola
        User user = userRepository.findByUsername(username);
        System.out.println(user);
        return user != null && user.getPassword().equals(password);
    }
}
