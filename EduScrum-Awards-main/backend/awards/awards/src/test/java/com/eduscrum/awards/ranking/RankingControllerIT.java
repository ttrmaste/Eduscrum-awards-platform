package com.eduscrum.awards.ranking;

import com.eduscrum.awards.model.*;
import com.eduscrum.awards.repository.*;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import com.eduscrum.awards.service.RankingService;
import java.time.LocalDate;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class RankingControllerIT {
    @Autowired
    private RankingService rankingService;

    @Autowired
    private AlunoRepository alunoRepository;

    @Autowired
    private EquipaRepository equipaRepository;

    @Autowired
    private MembroEquipaRepository membroEquipaRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private DisciplinaRepository disciplinaRepository;

    @Autowired
    private ProjetoRepository projetoRepository;

    @Autowired
    private EntityManager entityManager;

    private int testCounter = 0;

    @BeforeEach
    void limparBaseDados() {
        testCounter++;
        membroEquipaRepository.deleteAll();
        equipaRepository.deleteAll();
        projetoRepository.deleteAll();
        disciplinaRepository.deleteAll();
        cursoRepository.deleteAll();
        alunoRepository.deleteAll();
        professorRepository.deleteAll();
        adminRepository.deleteAll();
    }

    // ===== Helpers =====

    private Admin criarAdmin() {
        Admin admin = new Admin();
        admin.setNome("Admin Ranking");
        admin.setEmail("admin.ranking." + testCounter + "@test.com");
        admin.setPasswordHash("hash_admin");
        admin.setPapelSistema(PapelSistema.ADMIN);
        return adminRepository.save(admin);
    }

    private Curso criarCurso(Admin admin, String codigoCurso, String nomeCurso) {
        Curso curso = new Curso();
        curso.setCodigo(codigoCurso + "-" + testCounter);
        curso.setNome(nomeCurso);
        curso.setAdmin(admin);
        return cursoRepository.save(curso);
    }

    private Disciplina criarDisciplina(Curso curso, String codigo, String nome) {
        Disciplina d = new Disciplina(nome, codigo, curso);
        return disciplinaRepository.save(d);
    }

    private Projeto criarProjeto(Disciplina disciplina, String nomeProjeto) {
        // Use native insert to provide curso_id as the DB schema requires it
        LocalDate di = LocalDate.now();
        LocalDate df = di.plusDays(7);

        String sql = "INSERT INTO projeto (data_inicio, data_fim, descricao, disciplina_id, nome, curso_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6) RETURNING id";
        Query q = entityManager.createNativeQuery(sql);
        q.setParameter(1, java.sql.Date.valueOf(di));
        q.setParameter(2, java.sql.Date.valueOf(df));
        q.setParameter(3, "Projeto para testes de ranking");
        q.setParameter(4, disciplina.getId());
        q.setParameter(5, nomeProjeto);
        // disciplina -> curso relationship exists; use its id
        q.setParameter(6, disciplina.getCurso().getId());

        Number id = (Number) q.getSingleResult();
        return projetoRepository.findById(id.longValue()).orElseThrow();
    }

    private Equipa criarEquipa(Projeto projeto, String nomeEquipa) {
        Equipa equipa = new Equipa();
        equipa.setNome(nomeEquipa);
        equipa.setProjeto(projeto);
        return equipaRepository.save(equipa);
    }

    private Aluno criarAluno(String nome, String email, int pontos) {
        Aluno aluno = new Aluno();
        aluno.setNome(nome);
        aluno.setEmail(email + "." + testCounter);
        aluno.setPasswordHash("hash_aluno");
        aluno.setPapelSistema(PapelSistema.ALUNO);
        aluno.setTotalPontos(pontos);
        return alunoRepository.save(aluno);
    }

    private Professor criarProfessor(String nome, String email) {
        Professor p = new Professor();
        p.setNome(nome);
        p.setEmail(email + "." + testCounter);
        p.setPasswordHash("hash_prof");
        p.setPapelSistema(PapelSistema.PROFESSOR);
        p.setDepartamento("Depto Teste");
        return professorRepository.save(p);
    }

    private MembroEquipa adicionarMembro(Equipa equipa, Utilizador utilizador) {
        MembroEquipa me = new MembroEquipa();
        me.setEquipa(equipa);
        me.setUtilizador(utilizador);
        me.setDataEntrada(java.time.LocalDateTime.now());
        me.setPapelScrum(MembroEquipa.PapelScrum.DEV);
        return membroEquipaRepository.save(me);
    }

    @Test
    @DisplayName("getRankingGlobal deve devolver alunos ordenados por totalPontos desc")
    void getRankingGlobal_DeveOrdenarAlunosPorPontosDesc() {
        Aluno a1 = criarAluno("Aluno 1", "a1@test.com", 10);
        Aluno a2 = criarAluno("Aluno 2", "a2@test.com", 30);
        Aluno a3 = criarAluno("Aluno 3", "a3@test.com", 20);

        List<Aluno> ranking = rankingService.getRankingGlobal();

        assertEquals(3, ranking.size());
        assertEquals(a2.getId(), ranking.get(0).getId()); // 30
        assertEquals(a3.getId(), ranking.get(1).getId()); // 20
        assertEquals(a1.getId(), ranking.get(2).getId()); // 10
    }

    @Test
    @DisplayName("getRankingEquipasPorProjeto deve calcular soma e média de pontos e ordenar por média descrescente")
    void getRankingEquipasPorProjeto_DeveCalcularEOrdenarCorretamente() {
        Admin admin = criarAdmin();
        Curso curso = criarCurso(admin, "CURSO-RANK-1", "Curso Ranking 1");
        Disciplina disciplina = criarDisciplina(curso, "DISC-RANK-1", "Disciplina Ranking");
        Projeto projeto = criarProjeto(disciplina, "Projeto Ranking");

        Equipa equipaA = criarEquipa(projeto, "Equipa A");
        Aluno a1 = criarAluno("Aluno A1", "a1@equipaA.com", 10);
        Aluno a2 = criarAluno("Aluno A2", "a2@equipaA.com", 20);
        adicionarMembro(equipaA, a1);
        adicionarMembro(equipaA, a2);

        Equipa equipaB = criarEquipa(projeto, "Equipa B");
        Aluno b1 = criarAluno("Aluno B1", "b1@equipaB.com", 12);
        adicionarMembro(equipaB, b1);

        List<EquipaRankingDTO> ranking = rankingService.getRankingEquipasPorProjeto(projeto.getId());

        assertEquals(2, ranking.size(), "Devem existir 2 equipas no ranking");

        EquipaRankingDTO primeiro = ranking.get(0);
        EquipaRankingDTO segundo = ranking.get(1);

        // Equipa A deve vir primeiro (média 15.0)
        assertEquals("Equipa A", primeiro.getNomeEquipa());
        assertEquals(30, primeiro.getTotalPontosMembros());
        assertEquals(15.0, primeiro.getMediaPontos());

        // Equipa B em segundo
        assertEquals("Equipa B", segundo.getNomeEquipa());
        assertEquals(12, segundo.getTotalPontosMembros());
        assertEquals(12.0, segundo.getMediaPontos());
    }

    @Test
    @DisplayName("getRankingEquipasPorProjeto deve atribuir média 0.0 quando a equipa não tem alunos")
    void getRankingEquipasPorProjeto_DeveDarMediaZeroQuandoNaoHaAlunos() {
        Admin admin = criarAdmin();
        Curso curso = criarCurso(admin, "CURSO-RANK-2", "Curso Ranking 2");
        Disciplina disciplina = criarDisciplina(curso, "DISC-RANK-2", "Disciplina Sem Alunos");
        Projeto projeto = criarProjeto(disciplina, "Projeto Sem Alunos");

        Equipa equipa = criarEquipa(projeto, "Equipa Sem Alunos");

        // só adicionamos um membro que NÃO é Aluno (por ex. Professor)
        Professor prof = criarProfessor("Professor X", "prof@test.com");
        adicionarMembro(equipa, prof);

        List<EquipaRankingDTO> ranking = rankingService.getRankingEquipasPorProjeto(projeto.getId());

        assertEquals(1, ranking.size());
        EquipaRankingDTO dto = ranking.get(0);

        assertEquals("Equipa Sem Alunos", dto.getNomeEquipa());
        assertEquals(0, dto.getTotalPontosMembros());
        assertEquals(0.0, dto.getMediaPontos());
    }

    @Test
    @DisplayName("getRankingEquipasPorProjeto deve devolver lista vazia se projeto não tiver equipas")
    void getRankingEquipasPorProjeto_ProjetoSemEquipasDeveRetornarListaVazia() {
        Admin admin = criarAdmin();
        Curso curso = criarCurso(admin, "CURSO-RANK-3", "Curso Ranking 3");
        Disciplina disciplina = criarDisciplina(curso, "DISC-RANK-3", "Disciplina Sem Equipas");
        Projeto projeto = criarProjeto(disciplina, "Projeto Sem Equipas");

        List<EquipaRankingDTO> ranking = rankingService.getRankingEquipasPorProjeto(projeto.getId());

        assertNotNull(ranking);
        assertTrue(ranking.isEmpty());
    }

}
