package com.eduscrum.awards.repository;

import com.eduscrum.awards.model.Projeto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjetoRepository extends JpaRepository<Projeto, Long> {

    List<Projeto> findByDisciplinaId(Long disciplinaId);
}
