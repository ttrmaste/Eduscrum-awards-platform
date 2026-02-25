package com.eduscrum.awards.service;

import com.eduscrum.awards.model.Projeto;
import com.eduscrum.awards.model.Sprint;
import com.eduscrum.awards.model.SprintDTO;
import com.eduscrum.awards.repository.ProjetoRepository;
import com.eduscrum.awards.repository.SprintRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.annotation.Lazy;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Serviço responsável pela gestão de Sprints no sistema EduScrum.
 * Este serviço permite criar, listar, atualizar e eliminar sprints,
 * bem como processar premiações ao final de cada sprint.
 */
@Service
@Transactional
public class SprintService {

    private final SprintRepository sprintRepository;
    private final ProjetoRepository projetoRepository;
    private final GamificacaoService gamificacaoService;

    public SprintService(SprintRepository sprintRepository, ProjetoRepository projetoRepository,
            @Lazy GamificacaoService gamificacaoService) {
        this.sprintRepository = sprintRepository;
        this.projetoRepository = projetoRepository;
        this.gamificacaoService = gamificacaoService;
    }

    // Método para criar um novo Sprint
    public SprintDTO criar(Long projetoId, SprintDTO dto) {
        Projeto projeto = projetoRepository.findById(projetoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Projeto não encontrado"));

        // Validar se dataFim é anterior a dataInicio
        if (dto.getDataFim().isBefore(dto.getDataInicio())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Data Fim não pode ser anterior a Data Início");
        }

        Sprint sprint = new Sprint(dto.getNome(), dto.getObjetivos(), dto.getDataInicio(), dto.getDataFim(), projeto);
        // Assumimos estado inicial padrão se não vier no DTO
        if (dto.getEstado() != null) {
            sprint.setEstado(dto.getEstado());
        } else {
            sprint.setEstado("EM_CURSO");
        }

        sprint = sprintRepository.save(sprint);
        if ("CONCLUIDO".equals(sprint.getEstado())) {
            gamificacaoService.processarPremiosFimSprint(sprint);
        }
        return new SprintDTO(sprint);
    }

    // Método para atualizar Sprint
    public SprintDTO atualizar(Long id, SprintDTO dto) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sprint não encontrada"));

        // Validar se dataFim é anterior a dataInicio
        if (dto.getDataFim().isBefore(dto.getDataInicio())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Data Fim não pode ser anterior a Data Início");
        }

        String estadoAntigo = sprint.getEstado();

        // Atualizar campos
        sprint.setNome(dto.getNome());
        sprint.setObjetivos(dto.getObjetivos());
        sprint.setDataInicio(dto.getDataInicio());
        sprint.setDataFim(dto.getDataFim());
        sprint.setEstado(dto.getEstado());

        Sprint savedSprint = sprintRepository.save(sprint);

        // Se mudou para CONCLUIDO
        if (!"CONCLUIDO".equals(estadoAntigo) && "CONCLUIDO".equals(dto.getEstado())) {
            gamificacaoService.processarPremiosFimSprint(savedSprint);
        }

        return new SprintDTO(savedSprint);
    }

    // Método para listar Sprints por Projeto
    public List<SprintDTO> listarPorProjeto(Long projetoId) {
        return sprintRepository.findByProjetoId(projetoId).stream().map(SprintDTO::new).collect(Collectors.toList());
    }

    // Método para apagar um Sprint
    public void apagar(Long id) {
        if (!sprintRepository.existsById(id))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Sprint não encontrado");
        sprintRepository.deleteById(id);
    }
}