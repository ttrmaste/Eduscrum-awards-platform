package com.eduscrum.awards.model;

import jakarta.persistence.*;

@Entity
@Table(name = "aluno_curso")
public class AlunoCurso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id", nullable = false)
    private Utilizador aluno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    public AlunoCurso() {
    }

    public AlunoCurso(Utilizador aluno, Curso curso) {
        this.aluno = aluno;
        this.curso = curso;
    }

    public Long getId() {
        return id;
    }

    public Utilizador getAluno() {
        return aluno;
    }

    public void setAluno(Utilizador aluno) {
        this.aluno = aluno;
    }

    public Curso getCurso() {
        return curso;
    }

    public void setCurso(Curso curso) {
        this.curso = curso;
    }
}