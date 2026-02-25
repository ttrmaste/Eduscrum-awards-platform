package com.eduscrum.awards.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;

@Entity
@Table(name = "disciplina")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Disciplina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, length = 20)
    private String codigo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curso_id", nullable = false)
    @JsonIgnore
    private Curso curso;

    public Disciplina() {
    }

    public Disciplina(String nome, String codigo, Curso curso) {
        this.nome = nome;
        this.codigo = codigo;
        this.curso = curso;
    }

    // Getters
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getCodigo() { return codigo; }
    public Curso getCurso() { return curso; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setNome(String nome) { this.nome = nome; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public void setCurso(Curso curso) { this.curso = curso; }
}