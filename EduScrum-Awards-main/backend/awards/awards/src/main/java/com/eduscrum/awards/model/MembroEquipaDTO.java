package com.eduscrum.awards.model;

import java.time.LocalDateTime;

public class MembroEquipaDTO {
    private Long id;
    private Long idUtilizador;
    private String nomeUtilizador;
    private String emailUtilizador;
    private MembroEquipa.PapelScrum papelScrum;
    private LocalDateTime dataEntrada;

    // Construtores
    public MembroEquipaDTO() {}

    public MembroEquipaDTO(Long id, Long idUtilizador, String nomeUtilizador, String emailUtilizador, MembroEquipa.PapelScrum papelScrum, LocalDateTime dataEntrada) {
        this.id = id;
        this.idUtilizador = idUtilizador;
        this.nomeUtilizador = nomeUtilizador;
        this.emailUtilizador = emailUtilizador;
        this.papelScrum = papelScrum;
        this.dataEntrada = dataEntrada;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public Long getIdUtilizador() {
        return idUtilizador;
    }

    public String getNomeUtilizador() {
        return nomeUtilizador;
    }

    public String getEmailUtilizador() {
        return emailUtilizador;
    }

    public MembroEquipa.PapelScrum getPapelScrum() {
        return papelScrum;
    }

    public LocalDateTime getDataEntrada() {
        return dataEntrada;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setIdUtilizador(Long idUtilizador) {
        this.idUtilizador = idUtilizador;
    }

    public void setNomeUtilizador(String nomeUtilizador) {
        this.nomeUtilizador = nomeUtilizador;
    }

    public void setEmailUtilizador(String emailUtilizador) {
        this.emailUtilizador = emailUtilizador;
    }

    public void setPapelScrum(MembroEquipa.PapelScrum papelScrum) {
        this.papelScrum = papelScrum;
    }

    public void setDataEntrada(LocalDateTime dataEntrada) {
        this.dataEntrada = dataEntrada;
    }
}