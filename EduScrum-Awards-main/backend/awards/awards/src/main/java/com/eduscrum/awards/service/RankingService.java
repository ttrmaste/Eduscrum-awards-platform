package com.eduscrum.awards.service;

import com.eduscrum.awards.model.*;
import com.eduscrum.awards.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Serviço responsável pelo cálculo e disponibilização dos rankings do sistema.
 * Fornece métricas de desempenho para a gamificação, incluindo classificações
 * globais de alunos,
 * classificações por curso e classificações de equipas dentro de projetos
 * (baseadas na média de pontos dos membros).
 */
@Service
@Transactional(readOnly = true)
public class RankingService {

    private final AlunoRepository alunoRepository;
    private final EquipaRepository equipaRepository;
    private final MembroEquipaRepository membroEquipaRepository;

    public RankingService(AlunoRepository alunoRepository, EquipaRepository equipaRepository,
            MembroEquipaRepository membroEquipaRepository) {
        this.alunoRepository = alunoRepository;
        this.equipaRepository = equipaRepository;
        this.membroEquipaRepository = membroEquipaRepository;
    }

    // Ranking Individual

    public List<Aluno> getRankingGlobal() {
        return alunoRepository.findAllByOrderByTotalPontosDesc();
    }

    public List<Aluno> getRankingPorCurso(Long cursoId) {
        return alunoRepository.findTopAlunosByCurso(cursoId);
    }

    // Ranking de Equipas

    public List<EquipaRankingDTO> getRankingEquipasPorProjeto(Long projetoId) {
        List<Equipa> equipas = equipaRepository.findByProjetoId(projetoId);
        List<EquipaRankingDTO> ranking = new ArrayList<>();

        // Para cada equipa, calcular pontos
        for (Equipa equipa : equipas) {
            List<MembroEquipa> membros = membroEquipaRepository.findByEquipaId(equipa.getId());

            int somaPontos = 0;
            int numMembros = 0;

            for (MembroEquipa me : membros) {
                if (me.getUtilizador() instanceof Aluno) {
                    Aluno aluno = (Aluno) me.getUtilizador();
                    somaPontos += aluno.getTotalPontos();
                    numMembros++;
                }
            }

            double media = numMembros > 0 ? (double) somaPontos / numMembros : 0.0;
            media = Math.round(media * 10.0) / 10.0;

            ranking.add(new EquipaRankingDTO(equipa.getId(), equipa.getNome(), somaPontos, media));
        }

        // Ordenar por média decrescente
        return ranking.stream()
                .sorted(Comparator.comparingDouble(EquipaRankingDTO::getMediaPontos).reversed())
                .collect(Collectors.toList());
    }
}