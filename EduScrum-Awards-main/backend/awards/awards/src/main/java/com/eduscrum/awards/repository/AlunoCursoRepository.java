package com.eduscrum.awards.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eduscrum.awards.model.AlunoCurso;

public interface AlunoCursoRepository extends JpaRepository<AlunoCurso, Long> {

    // Todos os registos de cursos de um aluno
    List<AlunoCurso> findByAlunoId(Long alunoId);

    // Saber se o aluno já está em algum curso
    boolean existsByAlunoId(Long alunoId);

    // Saber se o aluno já está num curso específico
    Optional<AlunoCurso> findByAlunoIdAndCursoId(Long alunoId, Long cursoId);

    List<AlunoCurso> findByCursoId(Long cursoId);
}