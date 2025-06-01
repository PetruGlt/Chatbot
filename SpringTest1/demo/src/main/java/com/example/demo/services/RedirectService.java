package com.example.demo.services;

import com.example.demo.models.User;
import com.example.demo.repositories.UserRepository;
import com.example.demo.utils.AccessLevel;
import org.apache.tomcat.util.codec.binary.Base64;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.view.RedirectView;

@Service
public class RedirectService {
    private final UserRepository userRepository;

    public RedirectService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }


    public RedirectView redirectLogin(String authorizationHeader) {
        String base64Credentials = authorizationHeader.substring("Basic ".length());
        String credentials = new String(Base64.decodeBase64(base64Credentials));
        String[] values = credentials.split(":", 2);

        String username = values[0];

        User user = userRepository.findByUsername(username);
        if (user == null) {
            System.out.println("User not found: " + username);
            return new RedirectView("/login?error=user_not_found");
        }

        if (user.getAccess() == AccessLevel.USER) {
            System.out.println("Redirecting to user: " + username);
            return new RedirectView("/main");
        } else {
            System.out.println("Redirecting to expert: " + username);
            return new RedirectView("/mainExpert");
        }
    }

}
