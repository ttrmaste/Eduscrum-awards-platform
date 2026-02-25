package com.eduscrum.awards.model;

public class DisciplinaDetalhesDTO {

    private Long id;
    private String nome;
    private String codigo;
    private Long cursoId;
    private String cursoNome;

    public DisciplinaDetalhesDTO() {
    }

    public DisciplinaDetalhesDTO(Long id, String nome, String codigo,Long cursoId, String cursoNome) {
        this.id = id;
        this.nome = nome;
        this.codigo = codigo;
        this.cursoId = cursoId;
        this.cursoNome = cursoNome;
    }

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

    public String getCodigo() { 
        return codigo; 
    }
    public void setCodigo(String codigo) { 
        this.codigo = codigo; 
    }

    public Long getCursoId() { 
        return cursoId; 
    }
    public void setCursoId(Long cursoId) { 
        this.cursoId = cursoId; 
    }

    public String getCursoNome() { 
        return cursoNome; 
    }
    public void setCursoNome(String cursoNome) { 
        this.cursoNome = cursoNome; 
    }
}

