package com.eduscrum.awards.service;

import com.eduscrum.awards.model.*;
import com.eduscrum.awards.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.List;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Serviço responsável pelo módulo de Gamificação do sistema EduScrum.
 * Este serviço gere a criação de prémios, a atribuição de conquistas (manuais e
 * automáticas)
 * e o cálculo da pontuação dos alunos. Inclui lógica para processar recompensas
 * baseadas
 * no desempenho das equipas em Sprints.
 */
@Service
@Transactional
public class GamificacaoService {

    private final PremioRepository premioRepository;
    private final ConquistaRepository conquistaRepository;
    private final AlunoRepository alunoRepository;
    private final DisciplinaRepository disciplinaRepository;

    public GamificacaoService(PremioRepository premioRepository, ConquistaRepository conquistaRepository,
            AlunoRepository alunoRepository, DisciplinaRepository disciplinaRepository) {
        this.premioRepository = premioRepository;
        this.conquistaRepository = conquistaRepository;
        this.alunoRepository = alunoRepository;
        this.disciplinaRepository = disciplinaRepository;
    }

    // Gestão de Prémios

    public Premio criarPremio(Long disciplinaId, PremioDTO dto) {
        Disciplina d = disciplinaRepository.findById(disciplinaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Disciplina não encontrada"));

        Premio p = new Premio();
        p.setNome(dto.nome);
        p.setDescricao(dto.descricao);
        p.setValorPontos(dto.valorPontos);
        p.setTipo(Premio.TipoPremio.valueOf(dto.tipo));
        p.setDisciplina(d);

        return premioRepository.save(p);
    }

    public List<Premio> listarPremiosDaDisciplina(Long disciplinaId) {
        return premioRepository.findByDisciplinaId(disciplinaId);
    }

    // Atribuição e Pontuação

    public void atribuirPremio(Long premioId, Long alunoId) {
        Premio premio = premioRepository.findById(premioId)
                .orElseThrow(() -> new RuntimeException("Prémio não encontrado"));

        Aluno aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

        registarConquistaEAtualizarPontos(aluno, premio);
    }

    public List<Conquista> listarConquistasDoAluno(Long alunoId) {
        return conquistaRepository.findByAlunoId(alunoId);
    }

    // Lógica de Prémios Automáticos

    public void processarPremiosFimSprint(Sprint sprint) {
        LocalDate hoje = LocalDate.now();

        // Se a data de hoje for anterior ou igual à data fim, cumpriram o prazo
        if (!hoje.isAfter(sprint.getDataFim())) {

            List<Equipa> equipas = sprint.getProjeto().getEquipas();
            String nomePremio = "Velocidade Luz";

            for (Equipa equipa : equipas) {
                for (MembroEquipa membro : equipa.getMembros()) {
                    // Verificar se o membro é um Aluno
                    Utilizador utilizador = membro.getUtilizador();

                    if (utilizador instanceof Aluno) {
                        Aluno aluno = (Aluno) utilizador;

                        // Se já recebeu hoje, não dá outra vez
                        if (jaRecebeuPremioHoje(aluno, nomePremio)) {
                            continue;
                        }

                        // Atribuir prémio a cada aluno
                        atribuirPremioAutomatico(aluno, nomePremio, 10, sprint.getProjeto().getDisciplina());
                    }
                }
            }
        }
    }

    // Método auxiliar para evitar pontos infinitos
    private boolean jaRecebeuPremioHoje(Aluno aluno, String nomePremio) {
        List<Conquista> conquistas = conquistaRepository.findByAlunoId(aluno.getId());

        return conquistas.stream().anyMatch(c -> c.getPremio().getNome().equals(nomePremio) &&
                c.getDataAtribuicao().toLocalDate().isEqual(LocalDate.now()));
    }

    private void atribuirPremioAutomatico(Aluno aluno, String nome, int pontos, Disciplina disciplina) {

        // Tentar encontrar um prémio existente com o mesmo nome e disciplina
        // Isto evita criar duplicados na tabela Premio
        List<Premio> premiosExistentes = premioRepository.findByDisciplinaId(disciplina.getId());

        Premio premio = premiosExistentes.stream()
                .filter(p -> p.getNome().equals(nome) && p.getValorPontos() == pontos)
                .findFirst()
                .orElse(null);

        // Se não existir, cria um novo
        if (premio == null) {
            premio = new Premio();
            premio.setNome(nome);
            premio.setDescricao("Prémio automático: Sprint completada dentro do prazo!");
            premio.setValorPontos(pontos);
            premio.setDisciplina(disciplina);

            try {
                premio.setTipo(Premio.TipoPremio.valueOf("AUTOMATICO"));
            } catch (Exception e) {
                premio.setTipo(Premio.TipoPremio.MANUAL);
            }

            premio = premioRepository.save(premio);
        }

        // Registar a conquista
        registarConquistaEAtualizarPontos(aluno, premio);
    }

    private void registarConquistaEAtualizarPontos(Aluno aluno, Premio premio) {
        // Registar conquista
        Conquista conquista = new Conquista(aluno, premio);
        conquista.setDataAtribuicao(LocalDateTime.now());
        conquistaRepository.save(conquista);

        // Atualizar pontuação global
        int novaPontuacao = aluno.getTotalPontos() + premio.getValorPontos();
        aluno.setTotalPontos(novaPontuacao);
        alunoRepository.save(aluno);
    }
}