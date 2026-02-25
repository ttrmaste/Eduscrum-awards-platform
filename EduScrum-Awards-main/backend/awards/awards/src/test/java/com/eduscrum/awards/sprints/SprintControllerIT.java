package com.eduscrum.awards.sprints;

import com.eduscrum.awards.model.*;
import com.eduscrum.awards.repository.*;
import com.eduscrum.awards.service.SprintService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
class SprintControllerIT {

    @Autowired
    private SprintService sprintService;

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private ProjetoRepository projetoRepository;

    @Autowired
    private DisciplinaRepository disciplinaRepository;

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private AdminRepository adminRepository;

    private Projeto projetoTeste;

    @BeforeEach
    void setup() {
        sprintRepository.deleteAll();
        projetoRepository.deleteAll();
        disciplinaRepository.deleteAll();
        cursoRepository.deleteAll();
        adminRepository.deleteAll();

        projetoTeste = criarProjetoTeste();
    }

    // ========== HELPERS ==========

    private Projeto criarProjetoTeste() {
        // Criar Admin
        Admin admin = new Admin();
        admin.setNome("Admin Sprint Test");
        admin.setEmail("admin.sprint@test.com");
        admin.setPasswordHash("hash");
        admin.setPapelSistema(PapelSistema.ADMIN);
        admin = adminRepository.save(admin);

        // Criar Curso
        Curso curso = new Curso();
        curso.setNome("Curso Sprint Test");
        curso.setCodigo("SPRINT_TEST");
        curso.setAdmin(admin);
        curso = cursoRepository.save(curso);

        // Criar Disciplina
        Disciplina disciplina = new Disciplina();
        disciplina.setNome("Disciplina Sprint Test");
        disciplina.setCodigo("DISC_SPRINT");
        disciplina.setCurso(curso);
        disciplina = disciplinaRepository.save(disciplina);

        // Criar Projeto
        Projeto projeto = new Projeto();
        projeto.setNome("Projeto Sprint Test");
        projeto.setDescricao("Descrição teste");
        projeto.setDisciplina(disciplina);
        projeto.setDataInicio(LocalDate.of(2025, 1, 1));
        projeto.setDataFim(LocalDate.of(2025, 6, 30));

        return projetoRepository.save(projeto);
    }

    // ========== TESTES ==========

    @Test
    @DisplayName("Deve criar sprint com sucesso")
    void deveCriarSprintComSucesso() {
        // Arrange
        SprintDTO dto = new SprintDTO();
        dto.setNome("Sprint 1");
        dto.setObjetivos("Implementar login e registo");
        dto.setDataInicio(LocalDate.of(2025, 1, 1));
        dto.setDataFim(LocalDate.of(2025, 1, 14));

        // Act
        SprintDTO resultado = sprintService.criar(projetoTeste.getId(), dto);

        // Assert
        assertNotNull(resultado.getId(), "ID não deve ser nulo");
        assertEquals("Sprint 1", resultado.getNome());
        assertEquals("Implementar login e registo", resultado.getObjetivos());
        assertEquals(projetoTeste.getId(), resultado.getProjetoId());

        // Verificar que foi persistido
        assertTrue(sprintRepository.existsById(resultado.getId()));
    }

    @Test
    @DisplayName("Deve lançar exceção ao criar sprint com projeto inexistente")
    void deveLancarExcecaoAoCriarSprintComProjetoInexistente() {
        // Arrange
        SprintDTO dto = new SprintDTO();
        dto.setNome("Sprint Inválido");
        dto.setObjetivos("Não deve funcionar");
        dto.setDataInicio(LocalDate.of(2025, 1, 1));
        dto.setDataFim(LocalDate.of(2025, 1, 14));

        // Act & Assert
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> sprintService.criar(99999L, dto));

        assertEquals(404, exception.getStatusCode().value());
        assertTrue(exception.getReason().contains("Projeto não encontrado"));
    }

    @Test
    @DisplayName("Deve listar sprints por projeto")
    void deveListarSprintsPorProjeto() {
        // Arrange - Criar 3 sprints
        SprintDTO sprint1 = new SprintDTO();
        sprint1.setNome("Sprint 1");
        sprint1.setObjetivos("Objetivos 1");
        sprint1.setDataInicio(LocalDate.of(2025, 1, 1));
        sprint1.setDataFim(LocalDate.of(2025, 1, 14));

        SprintDTO sprint2 = new SprintDTO();
        sprint2.setNome("Sprint 2");
        sprint2.setObjetivos("Objetivos 2");
        sprint2.setDataInicio(LocalDate.of(2025, 1, 15));
        sprint2.setDataFim(LocalDate.of(2025, 1, 28));

        SprintDTO sprint3 = new SprintDTO();
        sprint3.setNome("Sprint 3");
        sprint3.setObjetivos("Objetivos 3");
        sprint3.setDataInicio(LocalDate.of(2025, 1, 29));
        sprint3.setDataFim(LocalDate.of(2025, 2, 11));

        sprintService.criar(projetoTeste.getId(), sprint1);
        sprintService.criar(projetoTeste.getId(), sprint2);
        sprintService.criar(projetoTeste.getId(), sprint3);

        // Act
        List<SprintDTO> sprints = sprintService.listarPorProjeto(projetoTeste.getId());

        // Assert
        assertEquals(3, sprints.size(), "Deve ter 3 sprints");
        assertTrue(sprints.stream().anyMatch(s -> s.getNome().equals("Sprint 1")));
        assertTrue(sprints.stream().anyMatch(s -> s.getNome().equals("Sprint 2")));
        assertTrue(sprints.stream().anyMatch(s -> s.getNome().equals("Sprint 3")));
    }

    @Test
    @DisplayName("Deve devolver lista vazia quando projeto não tem sprints")
    void deveDevolverListaVaziaQuandoProjetoNaoTemSprints() {
        // Act
        List<SprintDTO> sprints = sprintService.listarPorProjeto(projetoTeste.getId());

        // Assert
        assertNotNull(sprints);
        assertTrue(sprints.isEmpty(), "Lista deve estar vazia");
    }

    @Test
    @DisplayName("Deve apagar sprint com sucesso")
    void deveApagarSprintComSucesso() {
        // Arrange
        SprintDTO dto = new SprintDTO();
        dto.setNome("Sprint a Apagar");
        dto.setObjetivos("Este sprint vai ser apagado");
        dto.setDataInicio(LocalDate.of(2025, 1, 1));
        dto.setDataFim(LocalDate.of(2025, 1, 14));

        SprintDTO criado = sprintService.criar(projetoTeste.getId(), dto);
        Long sprintId = criado.getId();

        // Verificar que existe
        assertTrue(sprintRepository.existsById(sprintId));

        // Act
        sprintService.apagar(sprintId);

        // Assert
        assertFalse(sprintRepository.existsById(sprintId), "Sprint deve ter sido apagado");
    }

    @Test
    @DisplayName("Deve lançar exceção ao apagar sprint inexistente")
    void deveLancarExcecaoAoApagarSprintInexistente() {
        // Act & Assert
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> sprintService.apagar(99999L));

        assertEquals(404, exception.getStatusCode().value());
        assertTrue(exception.getReason().contains("Sprint não encontrado"));
    }

    @Test
    @DisplayName("Deve criar múltiplos sprints com datas consecutivas")
    void deveCriarMultiplosSprintsComDatasConsecutivas() {
        // Arrange & Act
        SprintDTO sprint1 = new SprintDTO();
        sprint1.setNome("Sprint 1");
        sprint1.setDataInicio(LocalDate.of(2025, 1, 1));
        sprint1.setDataFim(LocalDate.of(2025, 1, 14));
        sprint1.setObjetivos("Fase inicial");

        SprintDTO sprint2 = new SprintDTO();
        sprint2.setNome("Sprint 2");
        sprint2.setDataInicio(LocalDate.of(2025, 1, 15));
        sprint2.setDataFim(LocalDate.of(2025, 1, 28));
        sprint2.setObjetivos("Desenvolvimento");

        SprintDTO resultado1 = sprintService.criar(projetoTeste.getId(), sprint1);
        SprintDTO resultado2 = sprintService.criar(projetoTeste.getId(), sprint2);

        // Assert
        assertNotNull(resultado1.getId());
        assertNotNull(resultado2.getId());
        assertNotEquals(resultado1.getId(), resultado2.getId());

        List<SprintDTO> sprints = sprintService.listarPorProjeto(projetoTeste.getId());
        assertEquals(2, sprints.size());
    }

    @Test
    @DisplayName("Deve manter objetivos longos")
    void deveManterObjetivosLongos() {
        // Arrange
        String objetivosLongos = "Implementar sistema de autenticação completo com JWT, " +
                "incluindo refresh tokens, validação de email, recuperação " +
                "de password, proteção contra ataques CSRF, rate limiting, " +
                "e logging de todas as tentativas de login.";

        SprintDTO dto = new SprintDTO();
        dto.setNome("Sprint Complexo");
        dto.setObjetivos(objetivosLongos);
        dto.setDataInicio(LocalDate.of(2025, 1, 1));
        dto.setDataFim(LocalDate.of(2025, 1, 21));

        // Act
        SprintDTO resultado = sprintService.criar(projetoTeste.getId(), dto);

        // Assert
        assertEquals(objetivosLongos, resultado.getObjetivos());

        // Verificar que foi persistido corretamente
        Sprint sprintBD = sprintRepository.findById(resultado.getId()).orElse(null);
        assertNotNull(sprintBD);
        assertEquals(objetivosLongos, sprintBD.getObjetivos());
    }

    @Test
    @DisplayName("Sprints de projetos diferentes devem ser independentes")
    void sprintsDeDiferentesProjetosDevemSerIndependentes() {
        // Arrange - Criar outro projeto
        Disciplina novaDisciplina = new Disciplina();
        novaDisciplina.setNome("Outra Disciplina");
        novaDisciplina.setCodigo("DISC_2");
        novaDisciplina.setCurso(projetoTeste.getDisciplina().getCurso());
        novaDisciplina = disciplinaRepository.save(novaDisciplina);

        Projeto outroProjeto = new Projeto();
        outroProjeto.setNome("Outro Projeto");
        outroProjeto.setDescricao("Descrição");
        outroProjeto.setDisciplina(novaDisciplina);
        outroProjeto.setDataInicio(LocalDate.of(2025, 1, 1));
        outroProjeto.setDataFim(LocalDate.of(2025, 6, 30));
        outroProjeto = projetoRepository.save(outroProjeto);

        // Act - Criar sprints em cada projeto
        SprintDTO sprintProjeto1 = new SprintDTO();
        sprintProjeto1.setNome("Sprint Projeto 1");
        sprintProjeto1.setDataInicio(LocalDate.of(2025, 1, 1));
        sprintProjeto1.setDataFim(LocalDate.of(2025, 1, 14));

        SprintDTO sprintProjeto2 = new SprintDTO();
        sprintProjeto2.setNome("Sprint Projeto 2");
        sprintProjeto2.setDataInicio(LocalDate.of(2025, 1, 1));
        sprintProjeto2.setDataFim(LocalDate.of(2025, 1, 14));

        sprintService.criar(projetoTeste.getId(), sprintProjeto1);
        sprintService.criar(outroProjeto.getId(), sprintProjeto2);

        // Assert
        List<SprintDTO> sprintsProjeto1 = sprintService.listarPorProjeto(projetoTeste.getId());
        List<SprintDTO> sprintsProjeto2 = sprintService.listarPorProjeto(outroProjeto.getId());

        assertEquals(1, sprintsProjeto1.size());
        assertEquals(1, sprintsProjeto2.size());
        assertEquals("Sprint Projeto 1", sprintsProjeto1.get(0).getNome());
        assertEquals("Sprint Projeto 2", sprintsProjeto2.get(0).getNome());
    }


    @Test
    @DisplayName("Deve Lançar exceçao ao criar sprint quando a data dim for anterior a date inicio")
    void develancarExcecaoaoQuandoDataFimAnteriorDataInicio(){
        SprintDTO dto = new SprintDTO();
        dto.setNome("Sprint Inválido");
        dto.setObjetivos("Não deve funcionar");
        dto.setDataInicio(LocalDate.of(2025, 1, 15));
        dto.setDataFim(LocalDate.of(2025, 1, 14));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> sprintService.criar(projetoTeste.getId(), dto),"Data Fim não pode ser anterior a Data Início");


        assertEquals(400, exception.getStatusCode().value());
        assertTrue(exception.getReason().contains("Data Fim não pode ser anterior a Data Início"));


    }
}