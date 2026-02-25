package com.eduscrum.awards.curso;

import com.eduscrum.awards.model.Admin;
import com.eduscrum.awards.model.PapelSistema;
import com.eduscrum.awards.repository.AdminRepository;
import com.eduscrum.awards.repository.CursoRepository;
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

import static org.hamcrest.Matchers.hasItems;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CursoControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private CursoRepository cursoRepository;

    private Admin adminTeste;

    @BeforeEach
    void setup() {
        // Limpar BD
        cursoRepository.deleteAll();
        adminRepository.deleteAll();

        // Criar admin para usar nos testes
        adminTeste = new Admin();
        adminTeste.setNome("Admin Teste");
        adminTeste.setEmail("admin@test.com");
        adminTeste.setPasswordHash("senha_teste");
        adminTeste.setPapelSistema(PapelSistema.ADMIN);
        adminTeste = adminRepository.save(adminTeste);
    }

    @Test
    @DisplayName("Deve criar um curso com sucesso")
    void deveCriarCursoComSucesso() throws Exception {
        String novoCursoJson = """
                {
                  "nome": "Engenharia Informática",
                  "codigo": "EI2025",
                  "adminId": %d
                }
                """.formatted(adminTeste.getId());

        mockMvc.perform(post("/api/cursos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(novoCursoJson))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.nome").value("Engenharia Informática"))
                .andExpect(jsonPath("$.codigo").value("EI2025"));
    }

    @Test
    @DisplayName("Não deve permitir criar curso com código duplicado")
    void naoDeveCriarCursoComCodigoDuplicado() throws Exception {
        // Primeiro curso
        String curso1 = """
                {
                  "nome": "Curso Original",
                  "codigo": "CODIGO_DUP",
                  "adminId": %d
                }
                """.formatted(adminTeste.getId());

        mockMvc.perform(post("/api/cursos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(curso1))
                .andExpect(status().isOk());

        // Tentar criar duplicado
        String curso2 = """
                {
                  "nome": "Outro Curso",
                  "codigo": "CODIGO_DUP",
                  "adminId": %d
                }
                """.formatted(adminTeste.getId());

        mockMvc.perform(post("/api/cursos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(curso2))
                .andExpect(status().is5xxServerError()); // Ou específico se tiveres tratamento
    }

    @Test
    @DisplayName("Deve listar todos os cursos")
    void deveListarCursos() throws Exception {
        // Criar 2 cursos
        String curso1 = """
                {
                  "nome": "Curso A",
                  "codigo": "CURSO_A",
                  "adminId": %d
                }
                """.formatted(adminTeste.getId());

        String curso2 = """
                {
                  "nome": "Curso B",
                  "codigo": "CURSO_B",
                  "adminId": %d
                }
                """.formatted(adminTeste.getId());

        mockMvc.perform(post("/api/cursos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(curso1))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/cursos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(curso2))
                .andExpect(status().isOk());

        // Testar listagem
        mockMvc.perform(get("/api/cursos")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[*].nome").value(hasItems("Curso A", "Curso B")));
    }

    @Test
    @DisplayName("Deve obter curso por ID")
    void deveObterCursoPorId() throws Exception {
        // Criar curso
        String curso = """
                {
                  "nome": "Curso Teste ID",
                  "codigo": "TESTE_ID",
                  "adminId": %d
                }
                """.formatted(adminTeste.getId());

        String response = mockMvc.perform(post("/api/cursos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(curso))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // Extrair ID
        Long cursoId = Long.parseLong(response.split("\"id\":")[1].split(",")[0]);

        // Obter curso
        mockMvc.perform(get("/api/cursos/" + cursoId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Curso Teste ID"))
                .andExpect(jsonPath("$.codigo").value("TESTE_ID"));
    }

    @Test
    @DisplayName("Deve atualizar curso com sucesso")
    void deveAtualizarCursoComSucesso() throws Exception {
        // Criar curso
        String curso = """
                {
                  "nome": "Nome Antigo",
                  "codigo": "OLD",
                  "adminId": %d
                }
                """.formatted(adminTeste.getId());

        String response = mockMvc.perform(post("/api/cursos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(curso))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long cursoId = Long.parseLong(response.split("\"id\":")[1].split(",")[0]);

        // Atualizar
        String cursoAtualizado = """
                {
                  "nome": "Nome Novo",
                  "codigo": "NEW",
                  "adminId": %d
                }
                """.formatted(adminTeste.getId());

        mockMvc.perform(put("/api/cursos/" + cursoId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(cursoAtualizado))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Nome Novo"))
                .andExpect(jsonPath("$.codigo").value("NEW"));
    }

    @Test
    @DisplayName("Deve eliminar curso com sucesso")
    void deveEliminarCursoComSucesso() throws Exception {
        // Criar curso
        String curso = """
                {
                  "nome": "Curso Para Apagar",
                  "codigo": "DEL",
                  "adminId": %d
                }
                """.formatted(adminTeste.getId());

        String response = mockMvc.perform(post("/api/cursos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(curso))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long cursoId = Long.parseLong(response.split("\"id\":")[1].split(",")[0]);

        // Eliminar
        mockMvc.perform(delete("/api/cursos/" + cursoId))
                .andExpect(status().isNoContent());

        // Verificar que foi eliminado
        mockMvc.perform(get("/api/cursos/" + cursoId))
                .andExpect(status().is5xxServerError());
    }

    @Test
    @DisplayName("Não deve criar curso sem adminId")
    void naoDeveCriarCursoSemAdmin() throws Exception {
        String cursoSemAdmin = """
                {
                  "nome": "Curso Sem Admin",
                  "codigo": "NO_ADMIN"
                }
                """;

        mockMvc.perform(post("/api/cursos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(cursoSemAdmin))
                .andExpect(status().is5xxServerError());
    }
}