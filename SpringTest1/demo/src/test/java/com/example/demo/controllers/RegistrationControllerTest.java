package com.example.demo.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;

import com.mysql.cj.x.protobuf.MysqlxDatatypes;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class RegistrationControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Test
  public void testRegisterUser_success() throws Exception {
    String json = """
        {
          "username": "testuser12",
          "password": "parola123",
          "access": "USER"
        }
    """;

    mockMvc.perform(post("/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(Boolean.TRUE))
            .andExpect(jsonPath("$.message").value("Cont creat cu succes!"));
  }


  @Test
  public void testRegisterUser_duplicateUsername() throws Exception {
    String json = """
            {
              "username": "testuser123",
              "password": "parola123",
              "access": "USER"
            }
        """;

    mockMvc.perform(post("/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
            .andExpect(status().isOk());

    mockMvc.perform(post("/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.success").value(Boolean.FALSE))
            .andExpect(jsonPath("$.message", containsString("Username-ul este deja luat")));
  }



  /* @Test
   public void testRegisterUser_missingRequiredFields() throws Exception {
     String jsonMissingPassword = """
             {
               "username": "testuser1233",
               "access": "USER"
             }
         """;

     mockMvc.perform(post("/register")
         .contentType(MediaType.APPLICATION_JSON)
         .content(jsonMissingPassword))
         .andExpect(status().isBadRequest())
         .andExpect(jsonPath("$.success").value(false))
         .andExpect(jsonPath("$.message").value("Toate campurile sunt obligatorii"));

     String jsonMissingUsername = """
             {
               "password": "parola1",
               "access": "USER"
             }
         """;

     mockMvc.perform(post("/register")
         .contentType(MediaType.APPLICATION_JSON)
         .content(jsonMissingUsername))
         .andExpect(status().isBadRequest())
         .andExpect(jsonPath("$.success").value(false))
         .andExpect(jsonPath("$.message").value("Toate campurile sunt obligatorii"));
   }

  @Test
  public void testRegisterUser_invalidAccessLevel() throws Exception {
    String jsonInvalidAccess = """
            {
              "username": "testuser4567",
              "password": "parola123",
              "access": "INVALID_ROLE"
            }
        """;

    mockMvc.perform(post("/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonInvalidAccess))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Nivel de acces invalid"));
  }

@Test
public void testRegisterUser_passwordComplexityValidation() throws Exception {
    String jsonShortPassword = """
        {
          "username": "testuser7899",
          "password": "pass",
          "access": "USER"
        }
    """;
    
    mockMvc.perform(post("/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonShortPassword))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Parola trebuie sa contina minim 8 caractere"));
}*/
}