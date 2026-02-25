package com.eduscrum.awards.service;

import com.eduscrum.awards.model.Curso;
import com.eduscrum.awards.model.Utilizador;
import com.eduscrum.awards.model.CursoDTO;
import com.eduscrum.awards.model.Admin;
import com.eduscrum.awards.repository.CursoRepository;
import com.eduscrum.awards.repository.ProfessorCursoRepository;
import com.eduscrum.awards.repository.AlunoCursoRepository;
import com.eduscrum.awards.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Serviço responsável pela gestão de Cursos no sistema EduScrum.
 * Fornece funcionalidades para criar, listar, atualizar e eliminar cursos,
 * bem como consultar os professores e alunos associados a cada curso.
 */
@Service
public class CursoService {

    private final CursoRepository cursoRepository;
    private final AdminRepository adminRepository;
    private final ProfessorCursoRepository professorCursoRepository;
    private final AlunoCursoRepository alunoCursoRepository;

    @Autowired
    public CursoService(CursoRepository cursoRepository, AdminRepository adminRepository,
            ProfessorCursoRepository professorCursoRepository, AlunoCursoRepository alunoCursoRepository) {
        this.cursoRepository = cursoRepository;
        this.adminRepository = adminRepository;
        this.professorCursoRepository = professorCursoRepository;
        this.alunoCursoRepository = alunoCursoRepository;
    }

    public List<Curso> listarCursos() {
        return cursoRepository.findAll();
    }

    public Curso obterCursoPorId(Long id) {
        return cursoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Curso não encontrado com ID: " + id));
    }

    // Listar professores de um curso
    @Transactional(readOnly = true)
    public List<Utilizador> listarProfessoresDoCurso(Long cursoId) {
        // Verifica se o curso existe
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso não encontrado com ID: " + cursoId));

        // Log para debug
        System.out.println("Buscar professores do curso com ID: " + cursoId);

        // Busca todas as associações professor-curso
        List<Utilizador> professores = professorCursoRepository.findAll().stream()
                .peek(pc -> System.out.println("  - ProfessorCurso: professorId=" + pc.getProfessor().getId()
                        + ", cursoId=" + pc.getCurso().getId()))
                .filter(pc -> pc.getCurso().getId().equals(cursoId))
                .map(pc -> {
                    Utilizador prof = pc.getProfessor();
                    System.out.println("Professor encontrado: " + prof.getNome() + " (ID: " + prof.getId() + ")");
                    return prof;
                })
                .collect(Collectors.toList());

        System.out.println("Total de professores encontrados: " + professores.size());
        return professores;
    }

    // Listar alunos de um curso
    @Transactional(readOnly = true)
    public List<Utilizador> listarAlunosDoCurso(Long cursoId) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso não encontrado com ID: " + cursoId));

        // Log para debug
        System.out.println("Buscar alunos do curso com ID: " + cursoId);

        // Busca todas as associações aluno-curso
        List<Utilizador> alunos = alunoCursoRepository.findAll().stream()
                .peek(ac -> System.out.println(
                        "  - AlunoCurso: alunoId=" + ac.getAluno().getId() + ", cursoId=" + ac.getCurso().getId()))
                .filter(ac -> ac.getCurso().getId().equals(cursoId))
                .map(ac -> {
                    Utilizador aluno = ac.getAluno();
                    System.out.println("Aluno encontrado: " + aluno.getNome() + " (ID: " + aluno.getId() + ")");
                    return aluno;
                })
                .collect(Collectors.toList());

        System.out.println("Total de alunos encontrados: " + alunos.size());
        return alunos;
    }

    @Transactional
    public Curso criarCurso(CursoDTO dto) {
        if (cursoRepository.existsByCodigo(dto.codigo)) {
            throw new RuntimeException("Já existe um curso com o código: " + dto.codigo);
        }

        if (dto.adminId == null) {
            throw new RuntimeException("É necessário especificar um admin");
        }

        Admin admin = adminRepository.findById(dto.adminId)
                .orElseThrow(() -> new RuntimeException("Admin não encontrado com ID: " + dto.adminId));

        Curso curso = new Curso();
        curso.setNome(dto.nome);
        curso.setCodigo(dto.codigo);
        curso.setAdmin(admin);

        return cursoRepository.save(curso);
    }

    @Transactional
    public Curso atualizarCurso(Long id, CursoDTO dto) {
        Curso existente = obterCursoPorId(id);

        if (!existente.getCodigo().equals(dto.codigo)
                && cursoRepository.existsByCodigo(dto.codigo)) {
            throw new RuntimeException("Código de curso já utilizado");
        }

        existente.setNome(dto.nome);
        existente.setCodigo(dto.codigo);

        if (dto.adminId != null) {
            Admin admin = adminRepository.findById(dto.adminId)
                    .orElseThrow(() -> new RuntimeException("Admin não encontrado"));
            existente.setAdmin(admin);
        }

        return cursoRepository.save(existente);
    }

    @Transactional
    public void eliminarCurso(Long id) {
        if (!cursoRepository.existsById(id)) {
            throw new RuntimeException("Curso não encontrado com ID: " + id);
        }
        cursoRepository.deleteById(id);
    }
}