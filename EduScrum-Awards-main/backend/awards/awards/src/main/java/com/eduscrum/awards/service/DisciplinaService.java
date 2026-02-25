package com.eduscrum.awards.service;

import com.eduscrum.awards.model.Curso;
import com.eduscrum.awards.model.Disciplina;
import com.eduscrum.awards.model.DisciplinaDTO;
import com.eduscrum.awards.model.DisciplinaDetalhesDTO;
import com.eduscrum.awards.repository.CursoRepository;
import com.eduscrum.awards.repository.DisciplinaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * Serviço responsável pela gestão de Disciplinas.
 * Implementa a lógica de negócio para criar, listar, atualizar e remover
 * disciplinas,
 * garantindo a integridade dos dados e a associação correta com os Cursos.
 */
@Service
public class DisciplinaService {

    private final DisciplinaRepository disciplinaRepository;
    private final CursoRepository cursoRepository;

    public DisciplinaService(DisciplinaRepository disciplinaRepository, CursoRepository cursoRepository) {
        this.disciplinaRepository = disciplinaRepository;
        this.cursoRepository = cursoRepository;
    }

    @Transactional
    public Disciplina criarDisciplina(Long cursoId, DisciplinaDTO dto) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso não encontrado com ID: " + cursoId));

        Disciplina disciplina = new Disciplina();
        disciplina.setNome(dto.getNome());
        disciplina.setCodigo(dto.getCodigo());
        disciplina.setCurso(curso);

        return disciplinaRepository.save(disciplina);
    }

    public List<Disciplina> listarPorCurso(Long cursoId) {
        return disciplinaRepository.findByCursoId(cursoId);
    }

    @Transactional
    public Disciplina atualizarDisciplina(Long disciplinaId, DisciplinaDTO dto) {
        Disciplina disciplina = disciplinaRepository.findById(disciplinaId)
                .orElseThrow(() -> new RuntimeException("Disciplina não encontrada com ID: " + disciplinaId));

        disciplina.setNome(dto.getNome());
        disciplina.setCodigo(dto.getCodigo());

        return disciplinaRepository.save(disciplina);
    }

    @Transactional
    public void eliminarDisciplina(Long disciplinaId) {
        if (!disciplinaRepository.existsById(disciplinaId)) {
            throw new RuntimeException("Disciplina não encontrada com ID: " + disciplinaId);
        }
        disciplinaRepository.deleteById(disciplinaId);
    }

    public DisciplinaDetalhesDTO obterDisciplina(Long disciplinaId) {
        Disciplina disciplina = disciplinaRepository.findById(disciplinaId)
                .orElseThrow(() -> new RuntimeException(
                        "Disciplina não encontrada com ID: " + disciplinaId));

        Curso curso = disciplina.getCurso();

        Long cursoId = null;
        String cursoNome = null;

        if (curso != null) {
            cursoId = curso.getId();
            cursoNome = curso.getNome();
        }

        return new DisciplinaDetalhesDTO(
                disciplina.getId(),
                disciplina.getNome(),
                disciplina.getCodigo(),
                cursoId,
                cursoNome);
    }

}