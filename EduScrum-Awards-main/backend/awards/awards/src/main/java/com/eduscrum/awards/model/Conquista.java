package com.eduscrum.awards.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "conquista")
public class Conquista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime dataAtribuicao;

    @ManyToOne(optional = false)
    @JoinColumn(name = "aluno_id")
    private Aluno aluno;

    @ManyToOne(optional = false)
    @JoinColumn(name = "premio_id")
    private Premio premio;

    public Conquista() {
    }

    public Conquista(Aluno aluno, Premio premio) {
        this.aluno = aluno;
        this.premio = premio;
        this.dataAtribuicao = LocalDateTime.now();
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public Aluno getAluno() {
        return aluno;
    }

    public Premio getPremio() {
        return premio;
    }

    public LocalDateTime getDataAtribuicao() {
        return dataAtribuicao;
    }

    public void setDataAtribuicao(LocalDateTime dataAtribuicao) {
        this.dataAtribuicao = dataAtribuicao;
    }
}