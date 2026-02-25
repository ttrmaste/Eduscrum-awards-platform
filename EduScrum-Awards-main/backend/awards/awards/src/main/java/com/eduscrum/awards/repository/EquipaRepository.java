package com.eduscrum.awards.repository;

import com.eduscrum.awards.model.Equipa;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import java.util.Optional;

public interface EquipaRepository extends JpaRepository<Equipa, Long> {
    Optional<Equipa> findByNome(String nome);
    boolean existsByNome(String nome);
    List<Equipa> findByProjetoId(Long projetoId);
}
