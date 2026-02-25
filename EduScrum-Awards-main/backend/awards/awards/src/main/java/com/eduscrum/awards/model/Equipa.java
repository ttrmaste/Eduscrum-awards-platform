package com.eduscrum.awards.model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "equipa")
public class Equipa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nome;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_projeto")
    private Projeto projeto;

    @OneToMany(mappedBy = "equipa", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MembroEquipa> membros = new ArrayList<>();

    // Construtor vazio obrigatório para JPA
    public Equipa() {
    }

    // ---- GETTERS E SETTERS ----

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

    public Projeto getProjeto() {
        return projeto;
    }

    public void setProjeto(Projeto projeto) {
        this.projeto = projeto;
    }

    public List<MembroEquipa> getMembros() {
        return membros;
    }

    public void setMembros(List<MembroEquipa> membros) {
        this.membros = membros;
    }
}

