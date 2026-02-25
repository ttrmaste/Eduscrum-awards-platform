package com.eduscrum.awards.controller;

import com.eduscrum.awards.model.Disciplina;
import com.eduscrum.awards.model.DisciplinaDTO;
import com.eduscrum.awards.model.ProjetoDTO;
import com.eduscrum.awards.model.ProjetoRequestDTO;
import com.eduscrum.awards.service.DisciplinaService;
import com.eduscrum.awards.service.ProjetoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Controlador responsável pela gestão de Disciplinas no sistema EduScrum.
 * Este controlador permite listar todas as disciplinas de um curso,
 * obter uma disciplina por ID, criar, atualizar e eliminar disciplinas.
 */
@RestController
@RequestMapping("/api/cursos/{cursoId}/disciplinas")
@CrossOrigin(origins = "*")
public class DisciplinaController {

    private final DisciplinaService disciplinaService;
    private final ProjetoService projetoService;

    public DisciplinaController(DisciplinaService disciplinaService,
            ProjetoService projetoService) {
        this.disciplinaService = disciplinaService;
        this.projetoService = projetoService;
    }

    // Criar disciplina num curso
    @PostMapping
    public ResponseEntity<Disciplina> criarDisciplina(
            @PathVariable Long cursoId,
            @RequestBody DisciplinaDTO disciplinaDTO) {

        Disciplina disciplina = disciplinaService.criarDisciplina(cursoId, disciplinaDTO);
        return ResponseEntity.ok(disciplina);
    }

    // Listar disciplinas de um curso
    @GetMapping
    public List<Disciplina> listarDisciplinas(@PathVariable Long cursoId) {
        return disciplinaService.listarPorCurso(cursoId);
    }

    // Atualizar disciplina
    @PutMapping("/{disciplinaId}")
    public ResponseEntity<Disciplina> atualizarDisciplina(
            @PathVariable Long cursoId,
            @PathVariable Long disciplinaId,
            @RequestBody DisciplinaDTO disciplinaDTO) {

        Disciplina disciplina = disciplinaService.atualizarDisciplina(disciplinaId, disciplinaDTO);
        return ResponseEntity.ok(disciplina);
    }

    // Apagar disciplina
    @DeleteMapping("/{disciplinaId}")
    public ResponseEntity<Void> eliminarDisciplina(
            @PathVariable Long cursoId,
            @PathVariable Long disciplinaId) {

        disciplinaService.eliminarDisciplina(disciplinaId);
        return ResponseEntity.noContent().build();
    }

    // CRIAR PROJETO NUMA DISCIPLINA
    @PostMapping("/{disciplinaId}/projetos")
    public ResponseEntity<ProjetoDTO> criarProjeto(
            @PathVariable Long disciplinaId,
            @RequestBody ProjetoRequestDTO dto) {

        ProjetoDTO projeto = projetoService.criarProjeto(disciplinaId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(projeto);
    }

}
