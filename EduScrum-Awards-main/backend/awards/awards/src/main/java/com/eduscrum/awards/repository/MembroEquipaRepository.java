package com.eduscrum.awards.repository;

import com.eduscrum.awards.model.MembroEquipa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MembroEquipaRepository extends JpaRepository<MembroEquipa, Long> {

    List<MembroEquipa> findByEquipaId(Long equipaId);

    boolean existsByEquipaIdAndUtilizadorId(Long equipaId, Long utilizadorId);

    Optional<MembroEquipa> findByEquipaIdAndUtilizadorId(Long equipaId, Long utilizadorId);
}
