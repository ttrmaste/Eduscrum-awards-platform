package com.eduscrum.awards.repository;

import com.eduscrum.awards.model.Disciplina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisciplinaRepository extends JpaRepository<Disciplina, Long> {

    // Lista todas as disciplinas de um curso
    List<Disciplina> findByCursoId(Long cursoId);
}