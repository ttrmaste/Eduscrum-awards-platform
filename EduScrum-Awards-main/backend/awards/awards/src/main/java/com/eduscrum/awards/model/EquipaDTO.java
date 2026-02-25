package com.eduscrum.awards.model;

public class EquipaDTO {
    private Long id;
    private String nome;
    private Long idProjeto;

    // Construtores
    public EquipaDTO() {}

    public EquipaDTO(Long id, String nome, Long idProjeto) {
        this.id = id;
        this.nome = nome;
        this.idProjeto = idProjeto;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public Long getIdProjeto() {
        return idProjeto;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setIdProjeto(Long idProjeto) {
        this.idProjeto = idProjeto;
    }
}