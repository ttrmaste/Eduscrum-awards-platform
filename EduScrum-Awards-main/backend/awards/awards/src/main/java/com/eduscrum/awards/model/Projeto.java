package com.eduscrum.awards.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projeto")
public class Projeto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "disciplina_id", nullable = false)
    private Disciplina disciplina;

    @OneToMany(mappedBy = "projeto", cascade = CascadeType.ALL)
    private List<Equipa> equipas = new ArrayList<>();

    private LocalDate dataInicio;

    private LocalDate dataFim;

    public Projeto() {
    }

    public Projeto(String nome, String descricao, Disciplina disciplina, LocalDate dataInicio, LocalDate dataFim) {
        this.nome = nome;
        this.descricao = descricao;
        this.disciplina = disciplina;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
    }

    // getters e setters

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

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Disciplina getDisciplina() {
        return disciplina;
    }

    public void setDisciplina(Disciplina disciplina) {
        this.disciplina = disciplina;
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

    public List<Equipa> getEquipas() {
        return equipas;
    }

    public void setEquipas(List<Equipa> equipas) {
        this.equipas = equipas;
    }
}
