package com.eduscrum.awards.equipas;

import com.eduscrum.awards.model.*;
import com.eduscrum.awards.repository.*;
import com.eduscrum.awards.service.EquipaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
 public class EquipaControllerIT {

    @Autowired
    private EquipaService equipaService;

    @Autowired
    private EquipaRepository equipaRepository;

    @Autowired
    private MembroEquipaRepository membroEquipaRepository;

    @Autowired
    private ProjetoRepository projetoRepository;

    @Autowired
    private DisciplinaRepository disciplinaRepository;

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private UtilizadorRepository utilizadorRepository;

    private Projeto projetoTeste;
    private Utilizador alunoTeste1;
    private Utilizador alunoTeste2;
    private Utilizador professorTeste;

    @BeforeEach
    void setup() {
        // Limpar BD
        membroEquipaRepository.deleteAll();
        equipaRepository.deleteAll();
        projetoRepository.deleteAll();
        disciplinaRepository.deleteAll();
        cursoRepository.deleteAll();
        utilizadorRepository.deleteAll();
        adminRepository.deleteAll();

        // Criar estrutura base
        projetoTeste = criarProjetoTeste();
        alunoTeste1 = criarAlunoTeste("aluno1@test.com", "Aluno 1");
        alunoTeste2 = criarAlunoTeste("aluno2@test.com", "Aluno 2");
        professorTeste = criarProfessorTeste("prof@test.com", "Professor Teste");
    }

    // ========== HELPERS ==========

    private Projeto criarProjetoTeste() {
        // Admin
        Admin admin = new Admin();
        admin.setNome("Admin Equipa Test");
        admin.setEmail("admin.equipa@test.com");
        admin.setPasswordHash("hash");
        admin.setPapelSistema(PapelSistema.ADMIN);
        admin = adminRepository.save(admin);

        // Curso
        Curso curso = new Curso();
        curso.setNome("Curso Equipa Test");
        curso.setCodigo("EQUIPA_TEST");
        curso.setAdmin(admin);
        curso = cursoRepository.save(curso);

        // Disciplina
        Disciplina disciplina = new Disciplina();
        disciplina.setNome("Disciplina Equipa Test");
        disciplina.setCodigo("DISC_EQUIPA");
        disciplina.setCurso(curso);
        disciplina = disciplinaRepository.save(disciplina);

        // Projeto
        Projeto projeto = new Projeto();
        projeto.setNome("Projeto Equipa Test");
        projeto.setDescricao("Descrição teste");
        projeto.setDisciplina(disciplina);
        projeto.setDataInicio(LocalDate.of(2025, 1, 1));
        projeto.setDataFim(LocalDate.of(2025, 6, 30));

        return projetoRepository.save(projeto);
    }

    private Utilizador criarAlunoTeste(String email, String nome) {
        Aluno aluno = new Aluno();
        aluno.setNome(nome);
        aluno.setEmail(email);
        aluno.setPasswordHash("hash");
        aluno.setPapelSistema(PapelSistema.ALUNO);
        aluno.setTotalPontos(0);
        return utilizadorRepository.save(aluno);
    }

    private Utilizador criarProfessorTeste(String email, String nome) {
        Professor professor = new Professor();
        professor.setNome(nome);
        professor.setEmail(email);
        professor.setPasswordHash("hash");
        professor.setPapelSistema(PapelSistema.PROFESSOR);
        return utilizadorRepository.save(professor);
    }

    // ========== TESTES - CRIAR EQUIPA ==========

    @Test
    @DisplayName("Deve criar equipa com sucesso")
    void deveCriarEquipaComSucesso() {
        // Arrange
        EquipaCreateDTO dto = new EquipaCreateDTO();
        dto.setNome("Equipa Alpha");
        dto.setIdProjeto(projetoTeste.getId());

        // Act
        EquipaDTO resultado = equipaService.criar(dto);

        // Assert
        assertNotNull(resultado.getId(), "ID não deve ser nulo");
        assertEquals("Equipa Alpha", resultado.getNome());
        assertEquals(projetoTeste.getId(), resultado.getIdProjeto());

        // Verificar persistência
        assertTrue(equipaRepository.existsById(resultado.getId()));
    }

    @Test
    @DisplayName("Deve criar equipa sem projeto associado")
    void deveCriarEquipaSemProjeto() {
        // Arrange
        EquipaCreateDTO dto = new EquipaCreateDTO();
        dto.setNome("Equipa Beta");
        dto.setIdProjeto(null); // Sem projeto

        // Act
        EquipaDTO resultado = equipaService.criar(dto);

        // Assert
        assertNotNull(resultado.getId());
        assertEquals("Equipa Beta", resultado.getNome());
        assertNull(resultado.getIdProjeto());
    }

    @Test
    @DisplayName("Não deve criar equipa com nome duplicado")
    void naoDeveCriarEquipaComNomeDuplicado() {
        // Arrange
        EquipaCreateDTO dto1 = new EquipaCreateDTO();
        dto1.setNome("Equipa Unica");
        dto1.setIdProjeto(projetoTeste.getId());

        equipaService.criar(dto1);

        // Tentar criar duplicado
        EquipaCreateDTO dto2 = new EquipaCreateDTO();
        dto2.setNome("Equipa Unica");
        dto2.setIdProjeto(projetoTeste.getId());

        // Act & Assert
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> equipaService.criar(dto2));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Nome já existe"));
    }

    @Test
    @DisplayName("Não deve criar equipa com projeto inexistente")
    void naoDeveCriarEquipaComProjetoInexistente() {
        // Arrange
        EquipaCreateDTO dto = new EquipaCreateDTO();
        dto.setNome("Equipa Invalida");
        dto.setIdProjeto(99999L); // Projeto inexistente

        // Act & Assert
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> equipaService.criar(dto));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Projeto não encontrado"));
    }

    // ========== TESTES - LISTAR EQUIPAS ==========

    @Test
    @DisplayName("Deve listar todas as equipas")
    void deveListarTodasAsEquipas() {
        // Arrange - Criar 3 equipas
        EquipaCreateDTO dto1 = new EquipaCreateDTO("Equipa 1", projetoTeste.getId());
        EquipaCreateDTO dto2 = new EquipaCreateDTO("Equipa 2", projetoTeste.getId());
        EquipaCreateDTO dto3 = new EquipaCreateDTO("Equipa 3", null);

        equipaService.criar(dto1);
        equipaService.criar(dto2);
        equipaService.criar(dto3);

        // Act
        List<EquipaDTO> equipas = equipaService.listar();

        // Assert
        assertEquals(3, equipas.size());
        assertTrue(equipas.stream().anyMatch(e -> e.getNome().equals("Equipa 1")));
        assertTrue(equipas.stream().anyMatch(e -> e.getNome().equals("Equipa 2")));
        assertTrue(equipas.stream().anyMatch(e -> e.getNome().equals("Equipa 3")));
    }

    @Test
    @DisplayName("Deve listar equipas por projeto")
    void deveListarEquipasPorProjeto() {

        // ---------- Arrange ----------

        // Criar e salvar novo projeto
        Projeto outroProjeto = new Projeto();
        outroProjeto.setNome("Outro Projeto");
        outroProjeto.setDescricao("Desc");
        outroProjeto.setDisciplina(projetoTeste.getDisciplina());
        outroProjeto.setDataInicio(LocalDate.of(2025, 1, 1));
        outroProjeto.setDataFim(LocalDate.of(2025, 6, 30));

        Projeto projetoSalvo = projetoRepository.save(outroProjeto); // ← variável FINAL

        // Criar equipas associadas aos projetos
        EquipaCreateDTO dto1 = new EquipaCreateDTO("Equipa Projeto 1", projetoTeste.getId());
        EquipaCreateDTO dto2 = new EquipaCreateDTO("Equipa Projeto 1B", projetoTeste.getId());
        EquipaCreateDTO dto3 = new EquipaCreateDTO("Equipa Projeto 2", projetoSalvo.getId());

        equipaService.criar(dto1);
        equipaService.criar(dto2);
        equipaService.criar(dto3);

        // ---------- Act ----------
        List<EquipaDTO> equipasProjeto1 =
                equipaService.listarPorProjeto(projetoTeste.getId());

        List<EquipaDTO> equipasProjeto2 =
                equipaService.listarPorProjeto(projetoSalvo.getId());

        // ---------- Assert ----------
        assertEquals(2, equipasProjeto1.size());
        assertEquals(1, equipasProjeto2.size());

        assertTrue(
                equipasProjeto1.stream()
                        .allMatch(e -> e.getIdProjeto().equals(projetoTeste.getId()))
        );

        assertTrue(
                equipasProjeto2.stream()
                        .allMatch(e -> e.getIdProjeto().equals(projetoSalvo.getId()))
        );
    }


    @Test
    @DisplayName("Deve devolver lista vazia quando projeto não tem equipas")
    void deveDevolverListaVaziaQuandoProjetoNaoTemEquipas() {
        // Act
        List<EquipaDTO> equipas = equipaService.listarPorProjeto(projetoTeste.getId());

        // Assert
        assertNotNull(equipas);
        assertTrue(equipas.isEmpty());
    }

    // ========== TESTES - OBTER EQUIPA ==========

    @Test
    @DisplayName("Deve obter equipa por ID")
    void deveObterEquipaPorId() {
        // Arrange
        EquipaCreateDTO dto = new EquipaCreateDTO("Equipa Teste", projetoTeste.getId());
        EquipaDTO criada = equipaService.criar(dto);

        // Act
        EquipaDTO obtida = equipaService.obter(criada.getId());

        // Assert
        assertNotNull(obtida);
        assertEquals(criada.getId(), obtida.getId());
        assertEquals("Equipa Teste", obtida.getNome());
    }

    @Test
    @DisplayName("Deve lançar exceção ao obter equipa inexistente")
    void deveLancarExcecaoAoObterEquipaInexistente() {
        // Act & Assert
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> equipaService.obter(99999L));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Equipa não encontrada"));
    }

    // ========== TESTES - ATUALIZAR EQUIPA ==========

    @Test
    @DisplayName("Deve atualizar nome da equipa")
    void deveAtualizarNomeDaEquipa() {
        // Arrange
        EquipaCreateDTO dtoCreate = new EquipaCreateDTO("Nome Antigo", projetoTeste.getId());
        EquipaDTO criada = equipaService.criar(dtoCreate);

        EquipaUpdateDTO dtoUpdate = new EquipaUpdateDTO();
        dtoUpdate.setNome("Nome Novo");
        dtoUpdate.setIdProjeto(projetoTeste.getId());

        // Act
        EquipaDTO atualizada = equipaService.atualizar(criada.getId(), dtoUpdate);

        // Assert
        assertEquals("Nome Novo", atualizada.getNome());
        assertEquals(criada.getId(), atualizada.getId());
    }

    @Test
    @DisplayName("Deve atualizar projeto da equipa")
    void deveAtualizarProjetoDaEquipa() {
        // Arrange
        Projeto novoProjeto = new Projeto();
        novoProjeto.setNome("Novo Projeto");
        novoProjeto.setDescricao("Desc");
        novoProjeto.setDisciplina(projetoTeste.getDisciplina());
        novoProjeto.setDataInicio(LocalDate.of(2025, 1, 1));
        novoProjeto.setDataFim(LocalDate.of(2025, 6, 30));
        novoProjeto = projetoRepository.save(novoProjeto);

        EquipaCreateDTO dtoCreate = new EquipaCreateDTO("Equipa", projetoTeste.getId());
        EquipaDTO criada = equipaService.criar(dtoCreate);

        EquipaUpdateDTO dtoUpdate = new EquipaUpdateDTO();
        dtoUpdate.setNome("Equipa");
        dtoUpdate.setIdProjeto(novoProjeto.getId());

        // Act
        EquipaDTO atualizada = equipaService.atualizar(criada.getId(), dtoUpdate);

        // Assert
        assertEquals(novoProjeto.getId(), atualizada.getIdProjeto());
    }

    // ========== TESTES - APAGAR EQUIPA ==========

    @Test
    @DisplayName("Deve apagar equipa com sucesso")
    void deveApagarEquipaComSucesso() {
        // Arrange
        EquipaCreateDTO dto = new EquipaCreateDTO("Equipa a Apagar", projetoTeste.getId());
        EquipaDTO criada = equipaService.criar(dto);
        Long equipaId = criada.getId();

        assertTrue(equipaRepository.existsById(equipaId));

        // Act
        equipaService.apagar(equipaId);

        // Assert
        assertFalse(equipaRepository.existsById(equipaId));
    }

    @Test
    @DisplayName("Deve lançar exceção ao apagar equipa inexistente")
    void deveLancarExcecaoAoApagarEquipaInexistente() {
        // Act & Assert
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> equipaService.apagar(99999L));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    // ========== TESTES - ADICIONAR MEMBRO ==========

    @Test
    @DisplayName("Deve adicionar membro à equipa como DEV")
    void deveAdicionarMembroComoDevComSucesso() {
        // Arrange
        EquipaCreateDTO dtoEquipa = new EquipaCreateDTO("Equipa Dev", projetoTeste.getId());
        EquipaDTO equipa = equipaService.criar(dtoEquipa);

        MembroEquipaCreateDTO dtoMembro = new MembroEquipaCreateDTO();
        dtoMembro.setIdUtilizador(alunoTeste1.getId());
        dtoMembro.setPapelScrum(MembroEquipa.PapelScrum.DEV);

        // Act
        MembroEquipaDTO resultado = equipaService.adicionarMembro(equipa.getId(), dtoMembro);

        // Assert
        assertNotNull(resultado.getId());
        assertEquals(alunoTeste1.getId(), resultado.getIdUtilizador());
        assertEquals("Aluno 1", resultado.getNomeUtilizador());
        assertEquals(MembroEquipa.PapelScrum.DEV, resultado.getPapelScrum());
        assertNotNull(resultado.getDataEntrada());
    }

    @Test
    @DisplayName("Deve adicionar membro como PO")
    void deveAdicionarMembroComoPO() {
        // Arrange
        EquipaCreateDTO dtoEquipa = new EquipaCreateDTO("Equipa PO", projetoTeste.getId());
        EquipaDTO equipa = equipaService.criar(dtoEquipa);

        MembroEquipaCreateDTO dtoMembro = new MembroEquipaCreateDTO();
        dtoMembro.setIdUtilizador(alunoTeste1.getId());
        dtoMembro.setPapelScrum(MembroEquipa.PapelScrum.PO);

        // Act
        MembroEquipaDTO resultado = equipaService.adicionarMembro(equipa.getId(), dtoMembro);

        // Assert
        assertEquals(MembroEquipa.PapelScrum.PO, resultado.getPapelScrum());
    }

    @Test
    @DisplayName("Deve adicionar membro como SM")
    void deveAdicionarMembroComoSM() {
        // Arrange
        EquipaCreateDTO dtoEquipa = new EquipaCreateDTO("Equipa SM", projetoTeste.getId());
        EquipaDTO equipa = equipaService.criar(dtoEquipa);

        MembroEquipaCreateDTO dtoMembro = new MembroEquipaCreateDTO();
        dtoMembro.setIdUtilizador(alunoTeste1.getId());
        dtoMembro.setPapelScrum(MembroEquipa.PapelScrum.SM);

        // Act
        MembroEquipaDTO resultado = equipaService.adicionarMembro(equipa.getId(), dtoMembro);

        // Assert
        assertEquals(MembroEquipa.PapelScrum.SM, resultado.getPapelScrum());
    }

    @Test
    @DisplayName("Deve adicionar membro sem papel (default DEV)")
    void deveAdicionarMembroSemPapel() {
        // Arrange
        EquipaCreateDTO dtoEquipa = new EquipaCreateDTO("Equipa Default", projetoTeste.getId());
        EquipaDTO equipa = equipaService.criar(dtoEquipa);

        MembroEquipaCreateDTO dtoMembro = new MembroEquipaCreateDTO();
        dtoMembro.setIdUtilizador(alunoTeste1.getId());
        dtoMembro.setPapelScrum(null); // Sem papel

        // Act
        MembroEquipaDTO resultado = equipaService.adicionarMembro(equipa.getId(), dtoMembro);

        // Assert
        assertEquals(MembroEquipa.PapelScrum.DEV, resultado.getPapelScrum());
    }

    @Test
    @DisplayName("Não deve adicionar mesmo utilizador duas vezes à equipa")
    void naoDeveAdicionarMembroDuplicado() {
        // Arrange
        EquipaCreateDTO dtoEquipa = new EquipaCreateDTO("Equipa Duplicado", projetoTeste.getId());
        EquipaDTO equipa = equipaService.criar(dtoEquipa);

        MembroEquipaCreateDTO dtoMembro1 = new MembroEquipaCreateDTO();
        dtoMembro1.setIdUtilizador(alunoTeste1.getId());
        dtoMembro1.setPapelScrum(MembroEquipa.PapelScrum.DEV);

        equipaService.adicionarMembro(equipa.getId(), dtoMembro1);

        // Tentar adicionar novamente
        MembroEquipaCreateDTO dtoMembro2 = new MembroEquipaCreateDTO();
        dtoMembro2.setIdUtilizador(alunoTeste1.getId());
        dtoMembro2.setPapelScrum(MembroEquipa.PapelScrum.PO);

        // Act & Assert
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> equipaService.adicionarMembro(equipa.getId(), dtoMembro2));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        assertTrue(exception.getReason().contains("já pertence à equipa"));
    }

    @Test
    @DisplayName("Não deve adicionar membro com utilizador inexistente")
    void naoDeveAdicionarMembroComUtilizadorInexistente() {
        // Arrange
        EquipaCreateDTO dtoEquipa = new EquipaCreateDTO("Equipa Invalida", projetoTeste.getId());
        EquipaDTO equipa = equipaService.criar(dtoEquipa);

        MembroEquipaCreateDTO dtoMembro = new MembroEquipaCreateDTO();
        dtoMembro.setIdUtilizador(99999L); // Utilizador inexistente
        dtoMembro.setPapelScrum(MembroEquipa.PapelScrum.DEV);

        // Act & Assert
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> equipaService.adicionarMembro(equipa.getId(), dtoMembro));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Utilizador não encontrado"));
    }

    // ========== TESTES - LISTAR MEMBROS ==========

    @Test
    @DisplayName("Deve listar todos os membros da equipa")
    void deveListarTodosOsMembros() {
        // Arrange
        EquipaCreateDTO dtoEquipa = new EquipaCreateDTO("Equipa Membros", projetoTeste.getId());
        EquipaDTO equipa = equipaService.criar(dtoEquipa);

        // Adicionar 2 membros
        MembroEquipaCreateDTO membro1 = new MembroEquipaCreateDTO(alunoTeste1.getId(), MembroEquipa.PapelScrum.SM);
        MembroEquipaCreateDTO membro2 = new MembroEquipaCreateDTO(alunoTeste2.getId(), MembroEquipa.PapelScrum.DEV);

        equipaService.adicionarMembro(equipa.getId(), membro1);
        equipaService.adicionarMembro(equipa.getId(), membro2);

        // Act
        List<MembroEquipaDTO> membros = equipaService.listarMembros(equipa.getId());

        // Assert
        assertEquals(2, membros.size());
        assertTrue(membros.stream().anyMatch(m -> m.getNomeUtilizador().equals("Aluno 1")));
        assertTrue(membros.stream().anyMatch(m -> m.getNomeUtilizador().equals("Aluno 2")));
    }

    @Test
    @DisplayName("Deve devolver lista vazia quando equipa não tem membros")
    void deveDevolverListaVaziaQuandoEquipaSemMembros() {
        // Arrange
        EquipaCreateDTO dtoEquipa = new EquipaCreateDTO("Equipa Vazia", projetoTeste.getId());
        EquipaDTO equipa = equipaService.criar(dtoEquipa);

        // Act
        List<MembroEquipaDTO> membros = equipaService.listarMembros(equipa.getId());

        // Assert
        assertNotNull(membros);
        assertTrue(membros.isEmpty());
    }

    // ========== TESTES - REMOVER MEMBRO ==========

    @Test
    @DisplayName("Deve remover membro da equipa")
    void deveRemoverMembroDaEquipa() {
        // Arrange
        EquipaCreateDTO dtoEquipa = new EquipaCreateDTO("Equipa Remover", projetoTeste.getId());
        EquipaDTO equipa = equipaService.criar(dtoEquipa);

        MembroEquipaCreateDTO dtoMembro = new MembroEquipaCreateDTO(alunoTeste1.getId(), MembroEquipa.PapelScrum.DEV);
        equipaService.adicionarMembro(equipa.getId(), dtoMembro);

        // Verificar que foi adicionado
        List<MembroEquipaDTO> antesRemover = equipaService.listarMembros(equipa.getId());
        assertEquals(1, antesRemover.size());

        // Act
        equipaService.removerMembro(equipa.getId(), alunoTeste1.getId());

        // Assert
        List<MembroEquipaDTO> depoisRemover = equipaService.listarMembros(equipa.getId());
        assertTrue(depoisRemover.isEmpty());
    }

    @Test
    @DisplayName("Deve lançar exceção ao remover membro inexistente")
    void deveLancarExcecaoAoRemoverMembroInexistente() {
        // Arrange
        EquipaCreateDTO dtoEquipa = new EquipaCreateDTO("Equipa Teste", projetoTeste.getId());
        EquipaDTO equipa = equipaService.criar(dtoEquipa);

        // Act & Assert
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> equipaService.removerMembro(equipa.getId(), 99999L));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Membro não encontrado"));
    }

    @Test
    @DisplayName("Deve manter outros membros ao remover um específico")
    void deveManterOutrosMembrosAoRemoverEspecifico() {
        // Arrange
        EquipaCreateDTO dtoEquipa = new EquipaCreateDTO("Equipa Multi", projetoTeste.getId());
        EquipaDTO equipa = equipaService.criar(dtoEquipa);

        MembroEquipaCreateDTO membro1 = new MembroEquipaCreateDTO(alunoTeste1.getId(), MembroEquipa.PapelScrum.SM);
        MembroEquipaCreateDTO membro2 = new MembroEquipaCreateDTO(alunoTeste2.getId(), MembroEquipa.PapelScrum.DEV);

        equipaService.adicionarMembro(equipa.getId(), membro1);
        equipaService.adicionarMembro(equipa.getId(), membro2);

        // Act - Remover apenas aluno1
        equipaService.removerMembro(equipa.getId(), alunoTeste1.getId());

        // Assert
        List<MembroEquipaDTO> membros = equipaService.listarMembros(equipa.getId());
        assertEquals(1, membros.size());
        assertEquals("Aluno 2", membros.get(0).getNomeUtilizador());
    }
    


}