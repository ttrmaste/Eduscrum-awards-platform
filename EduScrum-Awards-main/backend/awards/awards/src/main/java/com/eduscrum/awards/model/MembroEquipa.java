package com.eduscrum.awards.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "membro_equipa", uniqueConstraints = {@UniqueConstraint(columnNames = {"equipa_id", "utilizador_id"})})
@Getter
@Setter
@NoArgsConstructor
public class MembroEquipa {

    public enum PapelScrum {
        DEV, PO, SM
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "equipa_id", nullable = false)
    private Equipa equipa;

    @ManyToOne(optional = false)
    @JoinColumn(name = "utilizador_id", nullable = false)
    private Utilizador utilizador;

    @Enumerated(EnumType.STRING)
    @Column(name = "papel_scrum", nullable = false)
    private PapelScrum papelScrum;

    @Column(name = "data_entrada", nullable = false)
    private LocalDateTime dataEntrada;

    

    // ---- GETTERS E SETTERS ----

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Equipa getEquipa() {
        return equipa;
    }

    public void setEquipa(Equipa equipa) {
        this.equipa = equipa;
    }

    public Utilizador getUtilizador() {
        return utilizador;
    }

    public void setUtilizador(Utilizador utilizador) {
        this.utilizador = utilizador;
    }

    public PapelScrum getPapelScrum() {
        return papelScrum;
    }

    public void setPapelScrum(PapelScrum papelScrum) {
        this.papelScrum = papelScrum;
    }

    public LocalDateTime getDataEntrada() {
        return dataEntrada;
    }

    public void setDataEntrada(LocalDateTime dataEntrada) {
        this.dataEntrada = dataEntrada;

    }
}
