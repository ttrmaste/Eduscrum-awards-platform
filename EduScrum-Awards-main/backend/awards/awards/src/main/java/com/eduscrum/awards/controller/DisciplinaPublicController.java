package com.eduscrum.awards.controller;

import com.eduscrum.awards.model.DisciplinaDetalhesDTO;
import com.eduscrum.awards.model.ProjetoDTO;
import com.eduscrum.awards.service.DisciplinaService;
import com.eduscrum.awards.service.ProjetoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador responsável pela gestão de Disciplinas no sistema EduScrum.
 * Este controlador permite listar todas as disciplinas de um curso,
 * obter uma disciplina por ID, criar, atualizar e eliminar disciplinas.
 */
@RestController
@RequestMapping("/api/disciplinas")
@CrossOrigin(origins = "*")
public class DisciplinaPublicController {

    private final DisciplinaService disciplinaService;
    private final ProjetoService projetoService;

    public DisciplinaPublicController(DisciplinaService disciplinaService,
            ProjetoService projetoService) {
        this.disciplinaService = disciplinaService;
        this.projetoService = projetoService;
    }

    // GET /api/disciplinas/{disciplinaId}
    @GetMapping("/{disciplinaId}")
    public ResponseEntity<DisciplinaDetalhesDTO> obterDisciplina(
            @PathVariable Long disciplinaId) {

        DisciplinaDetalhesDTO dto = disciplinaService.obterDisciplina(disciplinaId);
        return ResponseEntity.ok(dto);
    }

    // GET /api/disciplinas/{disciplinaId}/projetos
    @GetMapping("/{disciplinaId}/projetos")
    public ResponseEntity<List<ProjetoDTO>> listarProjetosDaDisciplina(
            @PathVariable Long disciplinaId) {

        List<ProjetoDTO> projetos = projetoService.listarProjetosDaDisciplina(disciplinaId);
        return ResponseEntity.ok(projetos);
    }
}
