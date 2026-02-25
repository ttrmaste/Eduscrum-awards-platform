package com.eduscrum.awards.model;

import java.time.LocalDate;

public class SprintDTO {
    private Long id;
    private String nome;
    private String objetivos;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private String estado;
    private Long projetoId;

    public SprintDTO() {
    }

    // Construtor para converter Entidade em DTO
    public SprintDTO(Sprint s) {
        this.id = s.getId();
        this.nome = s.getNome();
        this.objetivos = s.getObjetivos();
        this.dataInicio = s.getDataInicio();
        this.dataFim = s.getDataFim();
        this.estado = s.getEstado();
        this.projetoId = s.getProjeto().getId();
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getObjetivos() {
        return objetivos;
    }

    public void setObjetivos(String objetivos) {
        this.objetivos = objetivos;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDate getDataFim() {
        return dataFim;
    }

    public void setDataFim(LocalDate dataFim) {
        this.dataFim = dataFim;
    }

    public Long getProjetoId() {
        return projetoId;
    }

    public void setProjetoId(Long projetoId) {
        this.projetoId = projetoId;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

}