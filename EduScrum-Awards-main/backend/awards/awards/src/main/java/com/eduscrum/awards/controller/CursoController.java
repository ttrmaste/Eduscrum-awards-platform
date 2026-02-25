package com.eduscrum.awards.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.eduscrum.awards.model.Curso;
import com.eduscrum.awards.model.CursoDTO;
import com.eduscrum.awards.model.CursoResponseDTO;
import com.eduscrum.awards.model.Utilizador;
import com.eduscrum.awards.service.CursoService;

/**
 * Controlador responsável pela gestão de Cursos no sistema EduScrum.
 * Este controlador permite listar todos os cursos, obter um curso por ID,
 * listar professores e alunos de um curso, criar, atualizar e eliminar cursos.
 */
@RestController
@RequestMapping("/api/cursos")
@CrossOrigin(origins = "*")
public class CursoController {

    @Autowired
    private CursoService cursoService;

    // Listar todos os cursos
    @GetMapping
    public ResponseEntity<List<CursoResponseDTO>> listarCursos() {
        List<Curso> cursos = cursoService.listarCursos();

        List<CursoResponseDTO> cursosDTO = cursos.stream()
                .map(CursoResponseDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(cursosDTO);
    }

    // Obter curso por ID
    @GetMapping("/{id}")
    public ResponseEntity<CursoResponseDTO> obterCursoPorId(@PathVariable Long id) {
        Curso curso = cursoService.obterCursoPorId(id);
        return ResponseEntity.ok(new CursoResponseDTO(curso));
    }

    // Listar professores de um curso
    @GetMapping("/{id}/professores")
    public ResponseEntity<List<UtilizadorSimplificadoDTO>> listarProfessoresDoCurso(@PathVariable Long id) {
        List<Utilizador> professores = cursoService.listarProfessoresDoCurso(id);

        List<UtilizadorSimplificadoDTO> professoresDTO = professores.stream()
                .map(p -> new UtilizadorSimplificadoDTO(p.getId(), p.getNome(), p.getEmail()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(professoresDTO);
    }

    // Listar alunos de um curso
    @GetMapping("/{id}/alunos")
    public ResponseEntity<List<UtilizadorSimplificadoDTO>> listarAlunosDoCurso(@PathVariable Long id) {
        List<Utilizador> alunos = cursoService.listarAlunosDoCurso(id);

        List<UtilizadorSimplificadoDTO> alunosDTO = alunos.stream()
                .map(a -> new UtilizadorSimplificadoDTO(a.getId(), a.getNome(), a.getEmail()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(alunosDTO);
    }

    // Criar novo curso
    @PostMapping
    public ResponseEntity<Curso> criarCurso(@RequestBody CursoDTO cursoDTO) {
        Curso curso = cursoService.criarCurso(cursoDTO);
        return ResponseEntity.ok(curso);
    }

    // Atualizar curso
    @PutMapping("/{id}")
    public ResponseEntity<Curso> atualizarCurso(@PathVariable Long id, @RequestBody CursoDTO cursoDTO) {
        Curso curso = cursoService.atualizarCurso(id, cursoDTO);
        return ResponseEntity.ok(curso);
    }

    // Eliminar curso
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCurso(@PathVariable Long id) {
        cursoService.eliminarCurso(id);
        return ResponseEntity.noContent().build();
    }

    // DTO interno para retornar utilizadores simplificados
    public static class UtilizadorSimplificadoDTO {
        private Long id;
        private String nome;
        private String email;

        public UtilizadorSimplificadoDTO(Long id, String nome, String email) {
            this.id = id;
            this.nome = nome;
            this.email = email;
        }

        public Long getId() {
            return id;
        }

        public String getNome() {
            return nome;
        }

        public String getEmail() {
            return email;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public void setNome(String nome) {
            this.nome = nome;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

}