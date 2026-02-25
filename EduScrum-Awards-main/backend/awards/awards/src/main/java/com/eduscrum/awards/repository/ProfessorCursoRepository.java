package com.eduscrum.awards.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eduscrum.awards.model.ProfessorCurso;

public interface ProfessorCursoRepository extends JpaRepository<ProfessorCurso, Long> {

    List<ProfessorCurso> findByProfessorId(Long professorId);

    boolean existsByProfessorId(Long professorId);

    Optional<ProfessorCurso> findByProfessorIdAndCursoId(Long professorId, Long cursoId);
}
