package com.eduscrum.awards.repository;
import com.eduscrum.awards.model.Premio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PremioRepository extends JpaRepository<Premio, Long> {
    List<Premio> findByDisciplinaId(Long disciplinaId);
}
