package com.eduscrum.awards.Disciplina;

import com.eduscrum.awards.model.Admin;
import com.eduscrum.awards.model.Curso;
import com.eduscrum.awards.model.Disciplina;
import com.eduscrum.awards.model.PapelSistema;
import com.eduscrum.awards.repository.AdminRepository;
import com.eduscrum.awards.repository.CursoRepository;
import com.eduscrum.awards.repository.DisciplinaRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
class DisciplinaControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DisciplinaRepository disciplinaRepository;

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void limparBaseDados() {
        disciplinaRepository.deleteAll();
        cursoRepository.deleteAll();
        adminRepository.deleteAll();
    }

    // --- HELPER ---
    private Curso criarCursoDeTeste(String codigo) {
        Admin admin = new Admin();
        admin.setNome("Admin Teste Disciplina");
        admin.setEmail("admindisc_" + codigo + "@test.com"); // Email único
        admin.setPasswordHash("hash");
        admin.setPapelSistema(PapelSistema.ADMIN);
        admin = adminRepository.save(admin);

        Curso curso = new Curso();
        curso.setNome("Curso Teste Disciplina");
        curso.setCodigo(codigo);
        curso.setAdmin(admin);

        return cursoRepository.save(curso);
    }

    // --- TESTES DE INTEGRAÇÃO (VIA HTTP) ---

    @Test
    @DisplayName("Deve criar disciplina com sucesso")
    void deveCriarDisciplinaComSucesso() throws Exception {
        Curso curso = criarCursoDeTeste("CURSO_CRIAR");

        String disciplinaJson = """
                    {
                      "nome": "Disciplina Teste",
                      "codigo": "DISC_TESTE_1"
                    }
                """;

        mockMvc.perform(post("/api/cursos/{cursoId}/disciplinas", curso.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(disciplinaJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome", is("Disciplina Teste")))
                .andExpect(jsonPath("$.codigo", is("DISC_TESTE_1")));
    }

    @Test
    @DisplayName("Listar disciplinas por curso deve retornar disciplinas corretas")
    void listarDisciplinasPorCurso() throws Exception {
        Curso curso = criarCursoDeTeste("CURSO_LISTAR");

        // Criar dados diretamente no repositório para preparar o teste
        disciplinaRepository.save(new Disciplina("Disciplina 1", "D1", curso));
        disciplinaRepository.save(new Disciplina("Disciplina 2", "D2", curso));

        mockMvc.perform(get("/api/cursos/{cursoId}/disciplinas", curso.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].codigo", is("D1")))
                .andExpect(jsonPath("$[1].codigo", is("D2")));
    }

    @Test
    @DisplayName("Deve atualizar uma disciplina com sucesso")
    void atualizarDisciplina() throws Exception {
        Curso curso = criarCursoDeTeste("CURSO_UPDATE");
        Disciplina disciplina = new Disciplina("Original", "COD_ORIG", curso);
        disciplina = disciplinaRepository.save(disciplina);

        String updateJson = """
                    {
                      "nome": "Atualizada",
                      "codigo": "COD_UPD"
                    }
                """;

        mockMvc.perform(put("/api/cursos/{cursoId}/disciplinas/{disciplinaId}", curso.getId(), disciplina.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome", is("Atualizada")))
                .andExpect(jsonPath("$.codigo", is("COD_UPD")));
    }

    @Test
    @DisplayName("Eliminar disciplina com sucesso")
    void eliminarDisciplina() throws Exception {
        Curso curso = criarCursoDeTeste("CURSO_DELETE");
        Disciplina disciplina = new Disciplina("A Apagar", "DEL_1", curso);
        disciplina = disciplinaRepository.save(disciplina);

        mockMvc.perform(delete("/api/cursos/{cursoId}/disciplinas/{disciplinaId}", curso.getId(), disciplina.getId()))
                .andExpect(status().isNoContent());

        assertFalse(disciplinaRepository.existsById(disciplina.getId()));
    }

    @Test
    @DisplayName("Obter detalhes da disciplina (Endpoint Público)")
    void obterDetalhesDaDisciplina() throws Exception {
        // Nota: Este endpoint está no DisciplinaPublicController, mas testamos aqui a
        // integração completa
        Curso curso = criarCursoDeTeste("CURSO_DETALHE");
        Disciplina disciplina = new Disciplina("Matemática", "MAT_01", curso);
        disciplina = disciplinaRepository.save(disciplina);

        mockMvc.perform(get("/api/disciplinas/{disciplinaId}", disciplina.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome", is("Matemática")))
                .andExpect(jsonPath("$.cursoNome", is("Curso Teste Disciplina")));
    }
}