package com.eduscrum.awards.repository;

import com.eduscrum.awards.model.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CursoRepository extends JpaRepository<Curso, Long> {

    // Verifica se já existe um curso com um determinado código 
    boolean existsByCodigo(String codigo);

    // Pesquisa curso pelo código 
    Optional<Curso> findByCodigo(String codigo);
}
