package com.eduscrum.awards.controller;

import com.eduscrum.awards.model.Aluno;
import com.eduscrum.awards.model.EquipaRankingDTO;
import com.eduscrum.awards.service.RankingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controlador responsável pela gestão de Rankings no sistema EduScrum.
 * Este controlador permite obter o ranking global de alunos,
 * o ranking de alunos por curso e o ranking de equipas por projeto.
 */
@RestController
@RequestMapping("/api/rankings")
@CrossOrigin(origins = "*")
public class RankingController {

    private final RankingService rankingService;

    public RankingController(RankingService rankingService) {
        this.rankingService = rankingService;
    }

    // Top Alunos Global
    @GetMapping("/alunos/global")
    public ResponseEntity<List<AlunoResumoDTO>> getRankingGlobal() {
        List<Aluno> alunos = rankingService.getRankingGlobal();
        return ResponseEntity.ok(toDtoList(alunos));
    }

    // Top Alunos por Curso
    @GetMapping("/alunos/curso/{cursoId}")
    public ResponseEntity<List<AlunoResumoDTO>> getRankingPorCurso(@PathVariable Long cursoId) {
        List<Aluno> alunos = rankingService.getRankingPorCurso(cursoId);
        return ResponseEntity.ok(toDtoList(alunos));
    }

    // Top Equipas por Projeto
    @GetMapping("/equipas/projeto/{projetoId}")
    public ResponseEntity<List<EquipaRankingDTO>> getRankingEquipas(@PathVariable Long projetoId) {
        return ResponseEntity.ok(rankingService.getRankingEquipasPorProjeto(projetoId));
    }

    private List<AlunoResumoDTO> toDtoList(List<Aluno> alunos) {
        return alunos.stream()
                .map(a -> new AlunoResumoDTO(a.getId(), a.getNome(), a.getTotalPontos()))
                .collect(Collectors.toList());
    }

    static class AlunoResumoDTO {
        public Long id;
        public String nome;
        public int totalPontos;

        public AlunoResumoDTO(Long id, String nome, int totalPontos) {
            this.id = id;
            this.nome = nome;
            this.totalPontos = totalPontos;
        }
    }
}