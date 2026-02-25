package com.eduscrum.awards.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "curso")
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    @JsonIgnore
    private Admin admin;

    @OneToMany(
        mappedBy = "curso",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<Disciplina> disciplinas = new ArrayList<>();

    // --- Getters
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getCodigo() { return codigo; }
    public Admin getAdmin() { return admin; }
    public List<Disciplina> getDisciplinas() { return disciplinas; }

    // --- Setters
    public void setId(Long id) { this.id = id; }
    public void setNome(String nome) { this.nome = nome; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public void setAdmin(Admin admin) { this.admin = admin; }

    public void setDisciplinas(List<Disciplina> disciplinas) {
        this.disciplinas = disciplinas;
    }

    // Métodos helper opcionais
    public void adicionarDisciplina(Disciplina disciplina) {
        disciplinas.add(disciplina);
        disciplina.setCurso(this);
    }

    public void removerDisciplina(Disciplina disciplina) {
        disciplinas.remove(disciplina);
        disciplina.setCurso(null);
    }
}