package com.eduscrum.awards.repository;
import com.eduscrum.awards.model.Conquista;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConquistaRepository extends JpaRepository<Conquista, Long> {
    List<Conquista> findByAlunoId(Long alunoId);
}
