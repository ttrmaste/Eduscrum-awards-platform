package com.eduscrum.awards.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.eduscrum.awards.model.Aluno;
import com.eduscrum.awards.model.AlunoCurso;

import java.util.List;

public interface AlunoRepository extends JpaRepository<Aluno, Long> {

    // Ranking Global (Top Melhores Alunos da Plataforma)
    List<Aluno> findAllByOrderByTotalPontosDesc();

    // Ranking por Curso (Top Melhores Alunos de um Curso específico)
    @Query("SELECT a FROM Aluno a JOIN AlunoCurso ac ON a.id = ac.aluno.id WHERE ac.curso.id = :cursoId ORDER BY a.totalPontos DESC")
    List<Aluno> findTopAlunosByCurso(@Param("cursoId") Long cursoId);

}
