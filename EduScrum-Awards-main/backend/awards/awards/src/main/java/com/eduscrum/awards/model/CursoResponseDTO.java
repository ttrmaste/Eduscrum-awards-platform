package com.eduscrum.awards.model;

import java.util.List;
import java.util.stream.Collectors;

public class CursoResponseDTO {

    private Long id;
    private String nome;
    private String codigo;
    private Long adminId;

    private List<DisciplinaResponseDTO> disciplinas;

    public CursoResponseDTO() {}

    // Construtor que recebe a entidade Curso
    public CursoResponseDTO(Curso curso) {
        this.id = curso.getId();
        this.nome = curso.getNome();
        this.codigo = curso.getCodigo();

        // Se o curso tem admin 
        if (curso.getAdmin() != null) {
            this.adminId = curso.getAdmin().getId();
        }

        // Converter disciplinas
        if (curso.getDisciplinas() != null) {
            this.disciplinas = curso.getDisciplinas().stream()
                    .map(d -> new DisciplinaResponseDTO(
                            d.getId(),
                            d.getNome(),
                            d.getCodigo()
                    ))
                    .collect(Collectors.toList());
        }
    }

    // ---------- GETTERS ----------
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getCodigo() { return codigo; }
    public Long getAdminId() { return adminId; }

    public List<DisciplinaResponseDTO> getDisciplinas() {
        return disciplinas;
    }
}

