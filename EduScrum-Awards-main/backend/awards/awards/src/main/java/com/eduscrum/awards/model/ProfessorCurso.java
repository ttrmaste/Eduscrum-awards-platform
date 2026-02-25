package com.eduscrum.awards.model;

import jakarta.persistence.*;

@Entity
@Table(name = "professor_curso")
public class ProfessorCurso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professor_id", nullable = false)
    private Utilizador professor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    public ProfessorCurso() {
    }

    public ProfessorCurso(Utilizador professor, Curso curso) {
        this.professor = professor;
        this.curso = curso;
    }

    public Long getId() {
        return id;
    }

    public Utilizador getProfessor() {
        return professor;
    }

    public void setProfessor(Utilizador professor) {
        this.professor = professor;
    }

    public Curso getCurso() {
        return curso;
    }

    public void setCurso(Curso curso) {
        this.curso = curso;
    }
}
