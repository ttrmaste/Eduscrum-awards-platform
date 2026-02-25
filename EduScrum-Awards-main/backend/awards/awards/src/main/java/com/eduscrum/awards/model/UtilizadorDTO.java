package com.eduscrum.awards.model;

public class UtilizadorDTO {

    private String nome;
    private String email;
    private String password;
    private PapelSistema papelSistema;

    // ========== CONSTRUTORES ==========
    public UtilizadorDTO() {
    }

    public UtilizadorDTO(String nome, String email, String password, PapelSistema papelSistema) {
        this.nome = nome;
        this.email = email;
        this.password = password;
        this.papelSistema = papelSistema;
    }

    // ========== GETTERS ==========
    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public PapelSistema getPapelSistema() {
        return papelSistema;
    }

    // ========== SETTERS ==========
    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setPapelSistema(PapelSistema papelSistema) {
        this.papelSistema = papelSistema;
    }
}