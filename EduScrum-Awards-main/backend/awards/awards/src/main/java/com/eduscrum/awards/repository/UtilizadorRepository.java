package com.eduscrum.awards.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.eduscrum.awards.model.Utilizador;

import java.util.Optional;

public interface UtilizadorRepository extends JpaRepository<Utilizador, Long> {
    Optional<Utilizador> findByEmail(String email);
}

