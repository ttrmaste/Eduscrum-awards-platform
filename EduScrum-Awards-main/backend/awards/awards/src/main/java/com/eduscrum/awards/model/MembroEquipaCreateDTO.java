package com.eduscrum.awards.model;

import jakarta.validation.constraints.NotNull;

public class MembroEquipaCreateDTO {
    
    @NotNull(message = "ID do utilizador é obrigatório")
    private Long idUtilizador;
    
    private MembroEquipa.PapelScrum papelScrum;

    // Construtores
    public MembroEquipaCreateDTO() {}

    public MembroEquipaCreateDTO(Long idUtilizador, MembroEquipa.PapelScrum papelScrum) {
        this.idUtilizador = idUtilizador;
        this.papelScrum = papelScrum;
    }

    // Getters
    public Long getIdUtilizador() {
        return idUtilizador;
    }

    public MembroEquipa.PapelScrum getPapelScrum() {
        return papelScrum;
    }

    // Setters
    public void setIdUtilizador(Long idUtilizador) {
        this.idUtilizador = idUtilizador;
    }

    public void setPapelScrum(MembroEquipa.PapelScrum papelScrum) {
        this.papelScrum = papelScrum;
    }
}