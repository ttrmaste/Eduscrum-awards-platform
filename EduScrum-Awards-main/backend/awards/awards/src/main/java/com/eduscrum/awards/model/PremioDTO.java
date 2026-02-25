package com.eduscrum.awards.model;

public class PremioDTO {
    public Long id;
    public String nome;
    public String descricao;
    public int valorPontos;
    public String tipo; // "MANUAL" ou "AUTOMATICO"
    public Long disciplinaId;

    public PremioDTO() {}

    // Getters e Setters
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
    public String getTipo() {
        return tipo;
    }
    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
    public Long getDisciplinaId() {
        return disciplinaId;
    }
    public void setDisciplinaId(Long disciplinaId) {
        this.disciplinaId = disciplinaId;
    }
}