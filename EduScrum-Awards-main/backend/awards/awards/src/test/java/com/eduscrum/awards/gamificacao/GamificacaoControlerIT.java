package com.eduscrum.awards.gamificacao;

import org.springframework.boot.test.context.SpringBootTest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

import org.springframework.beans.factory.annotation.Autowired;
import com.eduscrum.awards.model.Premio;
import com.eduscrum.awards.service.GamificacaoService;
import com.eduscrum.awards.model.Aluno;
import com.eduscrum.awards.model.Disciplina;
import com.eduscrum.awards.model.PremioDTO;
import com.eduscrum.awards.repository.DisciplinaRepository;
import com.eduscrum.awards.model.Curso;
import com.eduscrum.awards.repository.CursoRepository;
import com.eduscrum.awards.repository.PremioRepository;
import com.eduscrum.awards.repository.AlunoRepository;
import com.eduscrum.awards.repository.ConquistaRepository;
import com.eduscrum.awards.model.PapelSistema;

@SpringBootTest
public class  GamificacaoControlerIT {

    private Disciplina disciplina;

    @Autowired
    private DisciplinaRepository disciplinaRepository;
    private Premio premio;
    private Aluno aluno;
    private Curso curso;

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private PremioRepository premioRepository;

    @Autowired
    private AlunoRepository alunoRepository;

    @Autowired
    private ConquistaRepository conquistaRepository;

    @Autowired
    private GamificacaoService gamificacaoService;

    @AfterEach
    void clearall() {
        conquistaRepository.deleteAll();
        premioRepository.deleteAll();
        alunoRepository.deleteAll();
        disciplinaRepository.deleteAll();
        cursoRepository.deleteAll();
    }

    @BeforeEach
    void setUp() {
        clearall();

        curso = new Curso();
        curso.setNome("Curso Teste");
        curso.setCodigo("CT101");
        cursoRepository.save(curso);

        // Criar dados de teste
        disciplina = new Disciplina();

        disciplina.setNome("Disciplina Teste");
        disciplina.setCodigo("DT101");
        disciplina.setCurso(curso);
        disciplinaRepository.save(disciplina);

        premio = new Premio();

        premio.setNome("Prémio Teste");
        premio.setDescricao("Descrição do Prémio Teste");
        premio.setValorPontos(100);
        premio.setTipo(Premio.TipoPremio.MANUAL);
        premio.setDisciplina(disciplina);

    }

    @Test
    void testeCriarPremio() {
        PremioDTO premioDTO = new PremioDTO();
        premioDTO.nome = "Prémio Teste";
        premioDTO.descricao = "Descrição do Prémio Teste";
        premioDTO.valorPontos = 100;
        premioDTO.tipo = "MANUAL";

        Premio premioCriado = gamificacaoService.criarPremio(disciplina.getId(), premioDTO);

        assert (premioCriado.getNome().equals(premioDTO.nome));
        assert (premioCriado.getDescricao().equals(premioDTO.descricao));
        assert (premioCriado.getValorPontos() == premioDTO.valorPontos);
        assert (premioCriado.getTipo().toString().equals(premioDTO.tipo));
        assert (premioCriado.getDisciplina().getId().equals(disciplina.getId()));

    }

    @Test
    @DisplayName("Teste para listar os premios de uma disciplina")
    void testeListarPremiosdaDisciplinas() {
        PremioDTO premioDTO1 = new PremioDTO();
        premioDTO1.nome = "Prémio Teste 1";
        premioDTO1.descricao = "Descrição do Prémio Teste 1";
        premioDTO1.valorPontos = 50;
        premioDTO1.tipo = "MANUAL";
        PremioDTO premioDTO2 = new PremioDTO();
        premioDTO2.nome = "Prémio Teste 2";
        premioDTO2.descricao = "Descrição do Prémio Teste 2";
        premioDTO2.valorPontos = 150;
        premioDTO2.tipo = "AUTOMATICO";

        gamificacaoService.criarPremio(disciplina.getId(), premioDTO1);
        gamificacaoService.criarPremio(disciplina.getId(), premioDTO2);

        var premios = gamificacaoService.listarPremiosDaDisciplina(disciplina.getId());

        assert (premios.size() != 0);

    }

    @Test
    @DisplayName("Teste para atribuir um prémio a um aluno")
    void testeAtribuirPremio() {
        aluno = new Aluno();
        aluno.setNome("Aluno Teste");
        aluno.setEmail("aluno@teste.com");
        aluno.setPasswordHash("senha123");
        aluno.setPapelSistema(PapelSistema.ALUNO);
        alunoRepository.save(aluno);

        premio = new Premio();
        premio.setNome("Premio Directo");
        premio.setDescricao("Desc");
        premio.setValorPontos(20);
        premio.setTipo(Premio.TipoPremio.MANUAL);
        premio.setDisciplina(disciplina);
        premioRepository.save(premio);

        gamificacaoService.atribuirPremio(premio.getId(), aluno.getId());
        var conquista = gamificacaoService.listarConquistasDoAluno(aluno.getId());
        assert (conquista.size() == 1);
        assert (conquista.get(0).getPremio().getId() == premio.getId());
        assert (conquista.get(0).getAluno().getTotalPontos() == premio.getValorPontos());

    }

    @Test
    @DisplayName("Teste para listar as conquistas de um aluno")
    void testeListarConquistasDoAluno() {

        aluno = new Aluno();
        aluno.setNome("Aluno Teste");
        aluno.setEmail("aluno@teste.com");
        aluno.setPasswordHash("senha123");
        aluno.setPapelSistema(PapelSistema.ALUNO);
        alunoRepository.save(aluno);


        Premio p = new Premio();
        p.setNome("Premio Directo");
        p.setDescricao("Desc");
        p.setValorPontos(20);
        p.setTipo(Premio.TipoPremio.MANUAL);
        p.setDisciplina(disciplina);
        premioRepository.save(p);

        gamificacaoService.atribuirPremio(p.getId(), aluno.getId());

        var conquistas = gamificacaoService.listarConquistasDoAluno(aluno.getId());

        assert (conquistas.size() > 0);
        assert (conquistas.get(0).getAluno().getId().equals(aluno.getId()));
        assert (conquistas.get(0).getPremio().getId().equals(p.getId()));
    }


    @Test 
    @DisplayName("Teste para atualizar a pontuação total do aluno ao receber um prémio")
    void testeAtualizarPontuacaoDoAluno() {
        aluno = new Aluno();
        aluno.setNome("Aluno Teste");
        aluno.setEmail("aluno@teste.com");
        aluno.setPasswordHash("senha123");
        aluno.setPapelSistema(PapelSistema.ALUNO);
        aluno.setTotalPontos(50);
        alunoRepository.save(aluno);

   


        Premio p = new Premio();
        p.setNome("Premio Directo");
        p.setDescricao("Desc");
        p.setValorPontos(20);
        p.setTipo(Premio.TipoPremio.MANUAL);
        p.setDisciplina(disciplina);
        premioRepository.save(p);


        var pontosAntes = aluno.getTotalPontos();
        gamificacaoService.atribuirPremio(p.getId(), aluno.getId());

        var alunoAtualizado = alunoRepository.findById(aluno.getId()).orElseThrow();
        assertEquals(pontosAntes + p.getValorPontos(), alunoAtualizado.getTotalPontos());
        

       
    }    
}