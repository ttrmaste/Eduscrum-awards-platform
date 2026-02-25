package com.eduscrum.awards.service;

import com.eduscrum.awards.model.*;
import com.eduscrum.awards.repository.*;

import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Serviço responsável pela gestão das Equipas Scrum.
 * Fornece funcionalidades para criar, atualizar, listar e eliminar equipas,
 * bem como gerir os membros (alunos/utilizadores) e os seus papéis Scrum dentro
 * de cada equipa.
 */
@Service
@Transactional
public class EquipaService {

    private final EquipaRepository equipaRepository;
    private final MembroEquipaRepository membroEquipaRepository;
    private final ProjetoRepository projetoRepository;
    private final UtilizadorRepository utilizadorRepository;

    public EquipaService(
            EquipaRepository equipaRepository,
            MembroEquipaRepository membroEquipaRepository,
            ProjetoRepository projetoRepository,
            UtilizadorRepository utilizadorRepository) {

        this.equipaRepository = equipaRepository;
        this.membroEquipaRepository = membroEquipaRepository;
        this.projetoRepository = projetoRepository;
        this.utilizadorRepository = utilizadorRepository;
    }

    // LISTAR TODAS AS EQUIPAS
    public List<EquipaDTO> listar() {
        return equipaRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // LISTAR EQUIPAS POR PROJETO
    public List<EquipaDTO> listarPorProjeto(Long projetoId) {

        // Garante que o projeto existe
        projetoRepository.findById(projetoId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Projeto não encontrado"));

        return equipaRepository.findByProjetoId(projetoId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // OBTER
    public EquipaDTO obter(Long id) {
        return toDTO(findEquipa(id));
    }

    // CRIAR EQUIPA
    public EquipaDTO criar(EquipaCreateDTO dto) {

        if (equipaRepository.existsByNome(dto.getNome())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Nome já existe");
        }

        Equipa e = new Equipa();
        e.setNome(dto.getNome());

        if (dto.getIdProjeto() != null) {
            Projeto p = projetoRepository.findById(dto.getIdProjeto())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Projeto não encontrado"));
            e.setProjeto(p);
        }

        e = equipaRepository.save(e);
        return toDTO(e);
    }

    // ATUALIZAR
    public EquipaDTO atualizar(Long id, EquipaUpdateDTO dto) {

        Equipa e = findEquipa(id);

        if (dto.getNome() != null && !dto.getNome().isBlank()) {
            e.setNome(dto.getNome());
        }

        if (dto.getIdProjeto() != null) {
            Projeto p = projetoRepository.findById(dto.getIdProjeto())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Projeto não encontrado"));
            e.setProjeto(p);
        }

        e = equipaRepository.save(e);
        return toDTO(e);
    }

    // APAGAR
    public void apagar(Long id) {
        Equipa e = findEquipa(id);
        equipaRepository.delete(e);
    }

    // LISTAR MEMBROS
    public List<MembroEquipaDTO> listarMembros(Long idEquipa) {
        findEquipa(idEquipa);

        return membroEquipaRepository.findByEquipaId(idEquipa)
                .stream()
                .map(this::toMembroDTO)
                .collect(Collectors.toList());
    }

    // ADICIONAR MEMBRO
    public MembroEquipaDTO adicionarMembro(Long idEquipa, MembroEquipaCreateDTO dto) {

        Equipa equipa = findEquipa(idEquipa);

        Utilizador utilizador = utilizadorRepository.findById(dto.getIdUtilizador())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilizador não encontrado"));

        if (membroEquipaRepository.existsByEquipaIdAndUtilizadorId(idEquipa, dto.getIdUtilizador())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Utilizador já pertence à equipa");
        }

        MembroEquipa me = new MembroEquipa();
        me.setEquipa(equipa);
        me.setUtilizador(utilizador);
        me.setPapelScrum(dto.getPapelScrum() != null
                ? dto.getPapelScrum()
                : MembroEquipa.PapelScrum.DEV);

        me.setDataEntrada(LocalDateTime.now());

        me = membroEquipaRepository.save(me);
        return toMembroDTO(me);
    }

    // REMOVER MEMBRO
    public void removerMembro(Long idEquipa, Long idUtilizador) {

        findEquipa(idEquipa);

        MembroEquipa me = membroEquipaRepository
                .findByEquipaIdAndUtilizadorId(idEquipa, idUtilizador)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membro não encontrado"));

        membroEquipaRepository.delete(me);
    }

    // CONVERSÃO PARA DTO
    private EquipaDTO toDTO(Equipa e) {
        if (e == null)
            return null;

        Long idProjeto = (e.getProjeto() != null) ? e.getProjeto().getId() : null;

        EquipaDTO dto = new EquipaDTO();
        dto.setId(e.getId());
        dto.setNome(e.getNome());
        dto.setIdProjeto(idProjeto);

        return dto;
    }

    private MembroEquipaDTO toMembroDTO(MembroEquipa me) {
        if (me == null)
            return null;

        Utilizador u = me.getUtilizador();

        MembroEquipaDTO dto = new MembroEquipaDTO();
        dto.setId(me.getId());
        dto.setIdUtilizador(u.getId());
        dto.setNomeUtilizador(u.getNome());
        dto.setEmailUtilizador(u.getEmail());
        dto.setPapelScrum(me.getPapelScrum());
        dto.setDataEntrada(me.getDataEntrada());

        return dto;
    }

    // FIND EQUIPA
    private Equipa findEquipa(Long id) {
        return equipaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipa não encontrada"));
    }
}
