package com.eduscrum.awards.service;

import com.eduscrum.awards.model.*;
import com.eduscrum.awards.repository.CursoRepository;
import com.eduscrum.awards.repository.DisciplinaRepository;
import com.eduscrum.awards.repository.ProjetoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Serviço responsável pela gestão de Projetos no sistema EduScrum.
 * Este serviço permite criar, listar, atualizar e eliminar projetos,
 * bem como consultar projetos associados a disciplinas ou cursos específicos.
 */
@Service
public class ProjetoService {

        private final ProjetoRepository projetoRepository;
        private final CursoRepository cursoRepository;
        private final DisciplinaRepository disciplinaRepository;

        public ProjetoService(ProjetoRepository projetoRepository, CursoRepository cursoRepository,
                        DisciplinaRepository disciplinaRepository) {
                this.projetoRepository = projetoRepository;
                this.cursoRepository = cursoRepository;
                this.disciplinaRepository = disciplinaRepository;
        }

        // POST /api/disciplinas/{id}/projetos
        public ProjetoDTO criarProjeto(Long disciplinaId, ProjetoRequestDTO dto) {

                // --- VALIDAÇÃO DE DATAS ---
                if (dto.getDataInicio() != null && dto.getDataFim() != null) {
                        if (dto.getDataInicio().isAfter(dto.getDataFim())) {
                                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                                "A data de início não pode ser posterior à data de fim.");
                        }
                }
                // --------------------------

                Disciplina disciplina = disciplinaRepository.findById(disciplinaId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND, "Disciplina não encontrada"));

                Projeto projeto = new Projeto(
                                dto.getNome(),
                                dto.getDescricao(),
                                disciplina,
                                dto.getDataInicio(),
                                dto.getDataFim());

                return toDTO(projetoRepository.save(projeto));
        }

        // GET projetos do curso
        public List<ProjetoDTO> listarProjetosDoCurso(Long cursoId) {

                Curso curso = cursoRepository.findById(cursoId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND, "Curso não encontrado"));

                return curso.getDisciplinas()
                                .stream()
                                .flatMap(disc -> projetoRepository.findByDisciplinaId(disc.getId()).stream())
                                .map(this::toDTO)
                                .collect(Collectors.toList());
        }

        public ProjetoDTO obterProjeto(Long projetoId) {
                Projeto projeto = projetoRepository.findById(projetoId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND, "Projeto não encontrado"));
                return toDTO(projeto);
        }

        public ProjetoDTO atualizarProjeto(Long projetoId, ProjetoRequestDTO dto) {
                Projeto projeto = projetoRepository.findById(projetoId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND, "Projeto não encontrado"));

                // --- VALIDAÇÃO DE DATAS ---
                if (dto.getDataInicio() != null && dto.getDataFim() != null) {
                        if (dto.getDataInicio().isAfter(dto.getDataFim())) {
                                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                                "A data de início não pode ser posterior à data de fim.");
                        }
                }
                // --------------------------

                projeto.setNome(dto.getNome());
                projeto.setDescricao(dto.getDescricao());
                projeto.setDataInicio(dto.getDataInicio());
                projeto.setDataFim(dto.getDataFim());

                return toDTO(projetoRepository.save(projeto));
        }

        public void eliminarProjeto(Long projetoId) {
                Projeto projeto = projetoRepository.findById(projetoId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND, "Projeto não encontrado"));
                projetoRepository.delete(projeto);
        }

        private ProjetoDTO toDTO(Projeto projeto) {
                return new ProjetoDTO(
                                projeto.getId(),
                                projeto.getNome(),
                                projeto.getDescricao(),
                                projeto.getDataInicio(),
                                projeto.getDataFim(),
                                projeto.getDisciplina() != null ? projeto.getDisciplina().getId() : null);
        }

        public List<ProjetoDTO> listarProjetosDaDisciplina(Long disciplinaId) {
                return projetoRepository.findByDisciplinaId(disciplinaId)
                                .stream()
                                .map(this::toDTO)
                                .collect(Collectors.toList());
        }

        public List<ProjetoDTO> listar() {
                return projetoRepository.findAll().stream()
                                .map(this::toDTO)
                                .collect(Collectors.toList());
        }

}