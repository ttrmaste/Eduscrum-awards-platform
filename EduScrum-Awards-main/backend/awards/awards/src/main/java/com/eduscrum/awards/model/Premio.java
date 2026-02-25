package com.eduscrum.awards.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "premio")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Premio {

    public enum TipoPremio {
        MANUAL, AUTOMATICO
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    private String descricao;

    @Column(nullable = false)
    private int valorPontos;

    @Enumerated(EnumType.STRING)
    private TipoPremio tipo; // MANUAL ou AUTOMATICO

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "disciplina_id", nullable = false)
    private Disciplina disciplina;

    public Premio() {}

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
    public int getValorPontos() { 
        return valorPontos; 
    }
    public void setValorPontos(int valorPontos) { 
        this.valorPontos = valorPontos; 
    }
    public TipoPremio getTipo() { 
        return tipo; 
    }
    public void setTipo(TipoPremio tipo) {
        this.tipo = tipo; 
    }
    public Disciplina getDisciplina() { 
        return disciplina; 
    }
    public void setDisciplina(Disciplina disciplina) { 
        this.disciplina = disciplina; 
    }
}