package com.eduscrum.awards.model;

public class EquipaCreateDTO {
    private String nome;
    private Long idProjeto;

    // Construtores
    public EquipaCreateDTO() {}

    public EquipaCreateDTO(String nome, Long idProjeto) {
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

