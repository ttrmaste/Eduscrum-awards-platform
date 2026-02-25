package com.eduscrum.awards.model;

public class DisciplinaDTO {
    private String nome;
    private String codigo;

    public DisciplinaDTO() {
    }

    public DisciplinaDTO(String nome, String codigo) {
        this.nome = nome;
        this.codigo = codigo;
    }

    public String getNome() { 
        return nome; 
    }
    public String getCodigo() { 
        return codigo; 
    }

    public void setNome(String nome) { 
        this.nome = nome; 
    }
    public void setCodigo(String codigo) { 
        this.codigo = codigo; 
    }
}