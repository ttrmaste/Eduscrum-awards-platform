package com.eduscrum.awards.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eduscrum.awards.model.Professor;

public interface ProfessorRepository extends JpaRepository<Professor, Long> {}

