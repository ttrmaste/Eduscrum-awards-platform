package com.eduscrum.awards.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.eduscrum.awards.model.Curso;
import com.eduscrum.awards.model.CursoResponseDTO;
import com.eduscrum.awards.service.AlunoCursoService;

/**
 * Controlador responsável pela gestão de associações entre Alunos e Cursos no
 * sistema EduScrum.
 * Este controlador permite associar um aluno a um curso, listar os cursos
 * associados a um aluno
 * e remover a associação entre um aluno e um curso.
 */
@RestController
@RequestMapping("/api/alunos")
@CrossOrigin(origins = "*")
public class AlunoCursoController {

    private final AlunoCursoService alunoCursoService;

    public AlunoCursoController(AlunoCursoService alunoCursoService) {
        this.alunoCursoService = alunoCursoService;
    }

    @PostMapping("/{alunoId}/cursos/{cursoId}")
    public ResponseEntity<Void> associarAlunoAoCurso(@PathVariable Long alunoId,
            @PathVariable Long cursoId) {
        alunoCursoService.adicionarAlunoAoCurso(alunoId, cursoId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{alunoId}/cursos")
    public ResponseEntity<List<CursoResponseDTO>> listarCursosDoAluno(@PathVariable Long alunoId) {
        List<Curso> cursos = alunoCursoService.listarCursosDoAluno(alunoId);

        List<CursoResponseDTO> cursosDTO = cursos.stream()
                .map(CursoResponseDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(cursosDTO);
    }

    @DeleteMapping("/{alunoId}/cursos/{cursoId}")
    public ResponseEntity<Void> removerAlunoDoCurso(@PathVariable Long alunoId,
            @PathVariable Long cursoId) {
        alunoCursoService.removerAlunoDoCurso(alunoId, cursoId);
        return ResponseEntity.noContent().build();
    }
}
