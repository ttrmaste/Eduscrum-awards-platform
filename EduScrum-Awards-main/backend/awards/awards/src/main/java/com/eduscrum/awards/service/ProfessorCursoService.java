package com.eduscrum.awards.service;

import com.eduscrum.awards.model.Aluno;
import com.eduscrum.awards.model.AlunoCurso;
import com.eduscrum.awards.model.Curso;
import com.eduscrum.awards.model.CursoDTO;
import com.eduscrum.awards.model.Professor;
import com.eduscrum.awards.model.ProfessorCurso;
import com.eduscrum.awards.repository.AlunoCursoRepository;
import com.eduscrum.awards.repository.CursoRepository;
import com.eduscrum.awards.repository.ProfessorCursoRepository;
import com.eduscrum.awards.repository.ProfessorRepository;
import org.hibernate.Hibernate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Serviço responsável pela gestão da associação entre Professores e Cursos.
 * Inclui funcionalidades para atribuir professores a cursos, remover essas
 * atribuições
 * e funcionalidades de relatório, como a exportação de notas/pontos dos alunos
 * para CSV.
 */
@Service
@Transactional
public class ProfessorCursoService {

    private final ProfessorCursoRepository professorCursoRepository;
    private final ProfessorRepository professorRepository;
    private final CursoRepository cursoRepository;
    private final AlunoCursoRepository alunoCursoRepository;

    public ProfessorCursoService(ProfessorCursoRepository professorCursoRepository,
            ProfessorRepository professorRepository,
            CursoRepository cursoRepository,
            AlunoCursoRepository alunoCursoRepository) {
        this.professorCursoRepository = professorCursoRepository;
        this.professorRepository = professorRepository;
        this.cursoRepository = cursoRepository;
        this.alunoCursoRepository = alunoCursoRepository;
    }

    public List<CursoDTO> listarCursosDoProfessor(Long professorId) {
        List<ProfessorCurso> associacoes = professorCursoRepository.findByProfessorId(professorId);
        return associacoes.stream()
                .map(pc -> new CursoDTO(pc.getCurso()))
                .collect(Collectors.toList());
    }

    public void associarProfessorACurso(Long professorId, Long cursoId) {
        Professor professor = professorRepository.findById(professorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Professor não encontrado"));

        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso não encontrado"));

        if (professorCursoRepository.findByProfessorId(professorId).stream()
                .anyMatch(pc -> pc.getCurso().getId().equals(cursoId))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Professor já associado a este curso");
        }

        ProfessorCurso pc = new ProfessorCurso();
        pc.setProfessor(professor);
        pc.setCurso(curso);
        professorCursoRepository.save(pc);
    }

    public void desassociarProfessorDeCurso(Long professorId, Long cursoId) {
        ProfessorCurso pc = professorCursoRepository.findByProfessorId(professorId).stream()
                .filter(p -> p.getCurso().getId().equals(cursoId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Associação não encontrada"));

        professorCursoRepository.delete(pc);
    }

    // EXPORTAR CSV COM UNPROXY
    public byte[] exportarNotasCsv(Long cursoId) {
        if (!cursoRepository.existsById(cursoId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso não encontrado");
        }

        List<AlunoCurso> inscricoes = alunoCursoRepository.findByCursoId(cursoId);

        StringBuilder csv = new StringBuilder();
        csv.append("\uFEFF");
        csv.append("ID;Nome do Aluno;Email;Total de Pontos\n");

        for (AlunoCurso ac : inscricoes) {
            // Desembrulhar o Proxy do Hibernate
            Object entity = Hibernate.unproxy(ac.getAluno());

            if (entity instanceof Aluno) {
                Aluno aluno = (Aluno) entity;

                csv.append(aluno.getId()).append(";")
                        .append(aluno.getNome()).append(";")
                        .append(aluno.getEmail()).append(";")
                        .append(aluno.getTotalPontos()).append("\n");
            }
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }
}