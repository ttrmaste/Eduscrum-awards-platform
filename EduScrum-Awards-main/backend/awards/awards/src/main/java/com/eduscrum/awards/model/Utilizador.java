package com.eduscrum.awards.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "utilizador")  
@Inheritance(strategy = InheritanceType.JOINED)
@Getter  // Mantém os getters do Lombok
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Utilizador {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PapelSistema papelSistema;

    private LocalDateTime criadoEm = LocalDateTime.now();

    // Getters manuais
    // ========== GETTERS MANUAIS ==========
    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public PapelSistema getPapelSistema() {
        return papelSistema;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }


    // Setters manuais
    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public void setPapelSistema(PapelSistema papelSistema) {
        this.papelSistema = papelSistema;
    }
}