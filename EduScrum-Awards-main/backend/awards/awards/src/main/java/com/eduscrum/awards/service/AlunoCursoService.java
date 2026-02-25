package com.eduscrum.awards.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eduscrum.awards.model.AlunoCurso;
import com.eduscrum.awards.model.Curso;
import com.eduscrum.awards.model.PapelSistema;
import com.eduscrum.awards.model.Utilizador;
import com.eduscrum.awards.repository.AlunoCursoRepository;
import com.eduscrum.awards.repository.CursoRepository;
import com.eduscrum.awards.repository.UtilizadorRepository;

/**
 * Serviço responsável pela gestão da associação entre Alunos e Cursos.
 * Esta classe implementa a lógica de negócio necessária para matricular alunos,
 * verificar restrições de inscrição (ex: um aluno num único curso) e gerir a
 * remoção de alunos dos cursos.
 */
@Service
public class AlunoCursoService {

    private final AlunoCursoRepository alunoCursoRepository;
    private final UtilizadorRepository utilizadorRepository;
    private final CursoRepository cursoRepository;

    public AlunoCursoService(AlunoCursoRepository alunoCursoRepository, UtilizadorRepository utilizadorRepository,
            CursoRepository cursoRepository) {
        this.alunoCursoRepository = alunoCursoRepository;
        this.utilizadorRepository = utilizadorRepository;
        this.cursoRepository = cursoRepository;
    }

    @Transactional
    public void adicionarAlunoAoCurso(Long alunoId, Long cursoId) {
        Utilizador aluno = utilizadorRepository.findById(alunoId)
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

        if (aluno.getPapelSistema() != PapelSistema.ALUNO) {
            throw new RuntimeException("Utilizador não é um aluno.");
        }

        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso não encontrado"));

        // Regra: um aluno só pode estar num curso
        if (alunoCursoRepository.existsByAlunoId(alunoId)) {
            throw new RuntimeException("O aluno já está associado a um curso.");
        }

        AlunoCurso alunoCurso = new AlunoCurso(aluno, curso);
        alunoCursoRepository.save(alunoCurso);
    }

    @Transactional(readOnly = true)
    public List<Curso> listarCursosDoAluno(Long alunoId) {
        List<AlunoCurso> relacoes = alunoCursoRepository.findByAlunoId(alunoId);

        return relacoes.stream()
                .map(AlunoCurso::getCurso)
                .collect(Collectors.toList());
    }

    @Transactional
    public void removerAlunoDoCurso(Long alunoId, Long cursoId) {
        AlunoCurso relacao = alunoCursoRepository.findByAlunoIdAndCursoId(alunoId, cursoId)
                .orElseThrow(() -> new RuntimeException("Associação aluno-curso não encontrada."));

        alunoCursoRepository.delete(relacao);
    }
}
