package com.eduscrum.awards.repository;

import com.eduscrum.awards.model.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SprintRepository extends JpaRepository<Sprint, Long> {
    List<Sprint> findByProjetoId(Long projetoId);
}