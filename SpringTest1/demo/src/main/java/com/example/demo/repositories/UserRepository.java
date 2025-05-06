package com.example.demo.repositories;

import com.example.demo.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository pentru entitatea User.
 * Oferă operațiuni CRUD implicite și metode custom pentru lucrul cu utilizatorii.
 */
public interface UserRepository extends JpaRepository<User, String> {

    /**
     * Găsește un utilizator după username.
     * @param username Username-ul utilizatorului căutat.
     * @return Utilizatorul găsit sau null dacă nu există.
     */
    User findByUsername(String username);
    boolean existsByUsername(String username);

}
