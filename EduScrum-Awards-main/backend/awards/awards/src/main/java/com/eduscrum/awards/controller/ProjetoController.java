package com.eduscrum.awards.controller;

import com.eduscrum.awards.model.ProjetoDTO;
import com.eduscrum.awards.model.ProjetoRequestDTO;
import com.eduscrum.awards.service.ProjetoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador responsável pela gestão de Projetos no sistema EduScrum.
 * Este controlador permite listar todos os projetos,
 * obter um projeto por ID, criar, atualizar e eliminar projetos.
 */
@RestController
@RequestMapping("/api")
public class ProjetoController {

    private final ProjetoService projetoService;

    public ProjetoController(ProjetoService projetoService) {
        this.projetoService = projetoService;
    }

    @GetMapping("/projetos")
    public ResponseEntity<List<ProjetoDTO>> listar() {
        return ResponseEntity.ok(projetoService.listar());
    }

    // Criar projeto numa disciplina
    @PostMapping("/disciplinas/{disciplinaId}/projetos")
    public ResponseEntity<ProjetoDTO> criarProjeto(
            @PathVariable Long disciplinaId,
            @RequestBody ProjetoRequestDTO dto) {

        ProjetoDTO criado = projetoService.criarProjeto(disciplinaId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    // Listar projetos de um curso
    @GetMapping("/cursos/{cursoId}/projetos")
    public ResponseEntity<List<ProjetoDTO>> listarProjetosDoCurso(
            @PathVariable Long cursoId) {

        List<ProjetoDTO> projetos = projetoService.listarProjetosDoCurso(cursoId);
        return ResponseEntity.ok(projetos);
    }

    @GetMapping("/projetos/{id}")
    public ResponseEntity<ProjetoDTO> obterProjeto(@PathVariable Long id) {
        return ResponseEntity.ok(projetoService.obterProjeto(id));
    }

    @PutMapping("/projetos/{id}")
    public ResponseEntity<ProjetoDTO> atualizarProjeto(
            @PathVariable Long id,
            @RequestBody ProjetoRequestDTO dto) {

        return ResponseEntity.ok(projetoService.atualizarProjeto(id, dto));
    }

    @DeleteMapping("/projetos/{id}")
    public ResponseEntity<Void> eliminarProjeto(@PathVariable Long id) {
        projetoService.eliminarProjeto(id);
        return ResponseEntity.noContent().build();
    }
}
