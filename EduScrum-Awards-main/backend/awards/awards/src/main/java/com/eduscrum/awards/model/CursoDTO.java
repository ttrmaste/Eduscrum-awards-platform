package com.eduscrum.awards.model;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class CursoDTO {
    public Long id;
    public String nome;
    public String codigo;
    public Long adminId;
    public List<DisciplinaSimpleDTO> disciplinas; // <--- Lista de disciplinas necessária!

    public CursoDTO() {
    }

    public CursoDTO(Curso curso) {
        this.id = curso.getId();
        this.nome = curso.getNome();
        this.codigo = curso.getCodigo();

        if (curso.getAdmin() != null) {
            this.adminId = curso.getAdmin().getId();
        }

        // <--- LÓGICA CRUCIAL PARA O DASHBOARD --->
        // Se o curso tiver disciplinas, convertemo-las para enviar ao frontend
        if (curso.getDisciplinas() != null) {
            this.disciplinas = curso.getDisciplinas().stream()
                    .map(d -> new DisciplinaSimpleDTO(d.getId(), d.getNome(), d.getCodigo()))
                    .collect(Collectors.toList());
        } else {
            this.disciplinas = new ArrayList<>();
        }
    }

    // --- CLASSE INTERNA PARA NÃO DAR ERRO ---
    // Isto serve apenas para transportar os dados simples da disciplina
    public static class DisciplinaSimpleDTO {
        public Long id;
        public String nome;
        public String codigo;

        public DisciplinaSimpleDTO(Long id, String nome, String codigo) {
            this.id = id;
            this.nome = nome;
            this.codigo = codigo;
        }
    }
}