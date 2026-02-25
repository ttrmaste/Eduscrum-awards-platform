package com.eduscrum.awards.controller;

import com.eduscrum.awards.model.Premio;
import com.eduscrum.awards.model.PremioDTO;
import com.eduscrum.awards.model.Conquista;
import com.eduscrum.awards.service.GamificacaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador responsável pela gestão de Gamificação no sistema EduScrum.
 * Este controlador permite criar prémios em disciplinas,
 * listar prémios de uma disciplina,
 * atribuir prémios a alunos e listar conquistas de um aluno.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class GamificacaoController {

    private final GamificacaoService service;

    public GamificacaoController(GamificacaoService service) {
        this.service = service;
    }

    // Criar prémio numa disciplina
    @PostMapping("/disciplinas/{id}/premios")
    public ResponseEntity<Premio> criarPremio(@PathVariable Long id, @RequestBody PremioDTO dto) {
        return ResponseEntity.ok(service.criarPremio(id, dto));
    }

    // Listar prémios da disciplina
    @GetMapping("/disciplinas/{id}/premios")
    public ResponseEntity<List<Premio>> listarPremios(@PathVariable Long id) {
        return ResponseEntity.ok(service.listarPremiosDaDisciplina(id));
    }

    // Atribuir prémio a um aluno (Pode ser feito pelo professor)
    @PostMapping("/premios/{premioId}/atribuir/{alunoId}")
    public ResponseEntity<Void> atribuirPremio(@PathVariable Long premioId, @PathVariable Long alunoId) {
        service.atribuirPremio(premioId, alunoId);
        return ResponseEntity.ok().build();
    }

    // Listar conquistas de um aluno (para o perfil/dashboard)
    @GetMapping("/alunos/{alunoId}/conquistas")
    public ResponseEntity<List<Conquista>> listarConquistas(@PathVariable Long alunoId) {
        return ResponseEntity.ok(service.listarConquistasDoAluno(alunoId));
    }
}