package com.eduscrum.awards.projects;

import com.eduscrum.awards.model.Admin;
import com.eduscrum.awards.model.Curso;
import com.eduscrum.awards.model.Disciplina;
import com.eduscrum.awards.model.PapelSistema;
import com.eduscrum.awards.model.Projeto;
import com.eduscrum.awards.model.ProjetoDTO;
import com.eduscrum.awards.model.ProjetoRequestDTO;
import com.eduscrum.awards.repository.AdminRepository;
import com.eduscrum.awards.repository.CursoRepository;
import com.eduscrum.awards.repository.DisciplinaRepository;
import com.eduscrum.awards.repository.ProjetoRepository;
import com.eduscrum.awards.service.ProjetoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
class ProjectControllerIT {

    @Autowired
    private ProjetoService projetoService;

    @Autowired
    private ProjetoRepository projetoRepository;

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private DisciplinaRepository disciplinaRepository;

    @Autowired
    private AdminRepository adminRepository;

    @BeforeEach
    void limparBaseDados() {
        projetoRepository.deleteAll();
        disciplinaRepository.deleteAll();
        cursoRepository.deleteAll();
        adminRepository.deleteAll();
    }

    // ---------- HELPERS ----------

    /**
     * Cria e persiste um Admin + Curso para usar nos testes.
     */
    private Curso criarCursoDeTeste(String codigoCurso) {
        Admin admin = new Admin();
        admin.setNome("Admin Teste Projetos");
        admin.setEmail("admin.projetos@teste.com");
        admin.setPasswordHash("hash_teste");
        admin.setPapelSistema(PapelSistema.ADMIN);
        admin = adminRepository.save(admin);

        Curso curso = new Curso();
        curso.setNome("Curso Teste Projetos");
        curso.setCodigo(codigoCurso);
        curso.setAdmin(admin);

        return cursoRepository.save(curso);
    }

    /**
     * Cria e persiste uma disciplina associada a um curso.
     */
    private Disciplina criarDisciplinaDeTeste(Curso curso, String codigoDisciplina) {
        Disciplina d = new Disciplina();
        d.setNome("Disciplina Teste Projetos");
        d.setCodigo(codigoDisciplina);
        curso.adicionarDisciplina(d);
        return disciplinaRepository.save(d);
    }

    // ---------- TESTES ----------

    @Test
    @DisplayName("criarProjeto deve criar um projeto associado à disciplina de um curso")
    void criarProjeto_DeveCriarProjetoNaDisciplina() {
        Curso curso = criarCursoDeTeste("CURSO_PROJ_1");
        Disciplina disciplina = criarDisciplinaDeTeste(curso, "DISC_PROJ_1");

        ProjetoRequestDTO dto = new ProjetoRequestDTO();
        dto.setNome("Projeto 1");
        dto.setDescricao("Projeto de teste");
        dto.setDataInicio(LocalDate.of(2025, 1, 1));
        dto.setDataFim(LocalDate.of(2025, 2, 1));

        // Usa o ID da DISCIPLINA, não do curso
        ProjetoDTO result = projetoService.criarProjeto(disciplina.getId(), dto);

        assertNotNull(result.getId(), "ID do projeto criado não deve ser nulo");
        assertEquals("Projeto 1", result.getNome());
        assertEquals(disciplina.getId(), result.getDisciplinaId());

        Optional<Projeto> projetoGuardado = projetoRepository.findById(result.getId());
        assertTrue(projetoGuardado.isPresent(), "Projeto deve estar persistido na base de dados");
        assertEquals("Projeto 1", projetoGuardado.get().getNome());
    }

   @Test
@DisplayName("listarProjetosDoCurso deve devolver todos os projetos de um curso")
void listarProjetosDoCurso_DeveListarProjetos() {
    // 1) Criar curso
    Curso curso = criarCursoDeTeste("CURSO_PROJ_2");

    // 2) Criar duas disciplinas associadas ao curso
    Disciplina d1 = criarDisciplinaDeTeste(curso, "DISC_A");
    Disciplina d2 = criarDisciplinaDeTeste(curso, "DISC_B");

    // 3) Criar projetos ligados às disciplinas )
    Projeto p1 = new Projeto(
            "Projeto A",
            "Descricao A",
            d1,
            LocalDate.of(2025, 1, 1),
            LocalDate.of(2025, 2, 1)
    );
    Projeto p2 = new Projeto(
            "Projeto B",
            "Descricao B",
            d2,
            LocalDate.of(2025, 3, 1),
            LocalDate.of(2025, 4, 1)
    );
    projetoRepository.save(p1);
    projetoRepository.save(p2);

    // 4) Chamar o serviço
    List<ProjetoDTO> projetos = projetoService.listarProjetosDoCurso(curso.getId());

    // 5) Verificar
    assertEquals(2, projetos.size(), "Deve devolver exatamente 2 projetos");
    assertTrue(
            projetos.stream().anyMatch(p -> p.getNome().equals("Projeto A")),
            "Lista deve conter Projeto A"
    );
    assertTrue(
            projetos.stream().anyMatch(p -> p.getNome().equals("Projeto B")),
            "Lista deve conter Projeto B"
    );
}

    @Test
    @DisplayName("obterProjeto deve devolver detalhes de um projeto existente")
    void obterProjeto_DeveDevolverProjeto() {
        Curso curso = criarCursoDeTeste("CURSO_PROJ_3");
        Disciplina disciplina = criarDisciplinaDeTeste(curso, "DISC_DET");

        Projeto projeto = new Projeto(
                "Projeto Detalhe",
                "Descricao Detalhe",
                disciplina,
                LocalDate.of(2025, 5, 1),
                LocalDate.of(2025, 6, 1)
        );
        projeto = projetoRepository.save(projeto);

        ProjetoDTO dto = projetoService.obterProjeto(projeto.getId());

        assertEquals(projeto.getId(), dto.getId());
        assertEquals("Projeto Detalhe", dto.getNome());
        assertEquals("Descricao Detalhe", dto.getDescricao());
        assertEquals(disciplina.getId(), dto.getDisciplinaId());
    }

    @Test
    @DisplayName("obterProjeto deve lançar NOT_FOUND se o projeto não existir")
    void obterProjeto_DeveLancarNotFoundQuandoInexistente() {
        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> projetoService.obterProjeto(9999L)
        );

        assertEquals(404, ex.getStatusCode().value());
    }

    @Test
    @DisplayName("atualizarProjeto deve alterar os dados de um projeto existente")
    void atualizarProjeto_DeveAtualizarDados() {
        Curso curso = criarCursoDeTeste("CURSO_PROJ_4");
        Disciplina disciplina = criarDisciplinaDeTeste(curso, "DISC_UPD");

        Projeto projeto = new Projeto(
                "Projeto Antigo",
                "Descricao antiga",
                disciplina,
                LocalDate.of(2025, 1, 1),
                LocalDate.of(2025, 2, 1)
        );
        projeto = projetoRepository.save(projeto);

        ProjetoRequestDTO dto = new ProjetoRequestDTO();
        dto.setNome("Projeto Atualizado");
        dto.setDescricao("Descricao nova");
        dto.setDataInicio(LocalDate.of(2025, 2, 1));
        dto.setDataFim(LocalDate.of(2025, 3, 1));

        ProjetoDTO atualizado = projetoService.atualizarProjeto(projeto.getId(), dto);

        assertEquals("Projeto Atualizado", atualizado.getNome());
        assertEquals("Descricao nova", atualizado.getDescricao());
        assertEquals(LocalDate.of(2025, 2, 1), atualizado.getDataInicio());
        assertEquals(LocalDate.of(2025, 3, 1), atualizado.getDataFim());
    }

    @Test
    @DisplayName("eliminarProjeto deve remover o projeto do repositório")
    void eliminarProjeto_DeveApagarProjeto() {
        Curso curso = criarCursoDeTeste("CURSO_PROJ_5");
        Disciplina disciplina = criarDisciplinaDeTeste(curso, "DISC_DEL");

        Projeto projeto = new Projeto(
                "Projeto Para Apagar",
                "Descricao qualquer",
                disciplina,
                LocalDate.of(2025, 7, 1),
                LocalDate.of(2025, 8, 1)
        );
        projeto = projetoRepository.save(projeto);

        Long id = projeto.getId();
        projetoService.eliminarProjeto(id);

        assertFalse(projetoRepository.findById(id).isPresent(), "Projeto deve ter sido apagado");
    }

    @Test
    @DisplayName("criarProjeto deve lançar NOT_FOUND se a disciplina não existir")
    void criarProjeto_DeveLancarNotFoundSeDisciplinaNaoExistir() {
        ProjetoRequestDTO dto = new ProjetoRequestDTO();
        dto.setNome("Projeto Invalido");
        dto.setDescricao("Disciplina não existe");
        dto.setDataInicio(LocalDate.of(2025, 1, 1));
        dto.setDataFim(LocalDate.of(2025, 2, 1));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> projetoService.criarProjeto(9999L, dto) // disciplinaId inexistente
        );

        assertEquals(404, ex.getStatusCode().value());
    }
}