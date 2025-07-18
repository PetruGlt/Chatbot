package com.example.demo.controllers;

import com.example.demo.services.AuthService;
import com.example.demo.services.RedirectService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

/**
 * Controller responsabil pentru gestionarea autentificării și a navigării între pagini.
 */
@Controller
public class LoginControler {

    // Serviciu pentru autentificare
    private final AuthService authService;
    private final RedirectService redirectService;

    // Constructor care injectează AuthService
    public LoginControler(AuthService authService, RedirectService redirectService) {
        this.authService = authService;
        this.redirectService = redirectService;
    }

    /**
     * Afișează pagina de login.
     * @return numele template-ului pentru pagina de client (client.html)
     */
    @GetMapping("/login")
    public String showLogin() {
        return "client";
    }

    /**
     * Procesează cererea de autentificare.
     * Primește credentialele din antetul Authorization.
     *
     * @param encodedCredentials Credentialele codificate.
     * @return Redirect către pagina principală dacă autentificarea reușește, altfel redirecționează înapoi la login cu un parametru de eroare.
     */
    @PostMapping("/login")
    public RedirectView processLogin(@RequestHeader("Authorization") String encodedCredentials) {
        System.out.println("Received credentials: " + encodedCredentials);

        if (authService.authenticate(encodedCredentials)) {
            return redirectService.redirectLogin(encodedCredentials);
        }

        return new RedirectView("/login?error=true");
    }


    /**
     * Afișează pagina principală după autentificare.
     * @return numele template-ului pentru pagina principală (MainPage.html)
     */
    @GetMapping("/main")
    public String showMainPage() {
        return "MainPage";  // Aceasta va reda MainPage.html
    }

    @GetMapping("/mainExpert")
    public String showMainExpertPage() {
        return "mainPageExpert";
    }


    /**
     * Afișează pagina clientului.
     * @return numele template-ului pentru client (client.html)
     */
    @GetMapping("/client")
    public String client() {
        return "client";
    }

    /**
     * Afișează pagina expertului.
     * @return numele template-ului pentru expert (expert.html)
     */
    @GetMapping("/expert")
    public String expert() {
        return "expert";
    }
}
