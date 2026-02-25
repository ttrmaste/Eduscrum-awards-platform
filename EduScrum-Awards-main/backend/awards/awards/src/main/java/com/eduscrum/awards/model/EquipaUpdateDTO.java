package com.eduscrum.awards.model;

public class EquipaUpdateDTO {
    private String nome;
    private Long idProjeto;

    // Construtores
    public EquipaUpdateDTO() {}

    public EquipaUpdateDTO(String nome, Long idProjeto) {
        this.nome = nome;
        this.idProjeto = idProjeto;
    }

    // Getters
    public String getNome() {
        return nome;
    }

    public Long getIdProjeto() {
        return idProjeto;
    }

    // Setters
    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setIdProjeto(Long idProjeto) {
        this.idProjeto = idProjeto;
    }
}