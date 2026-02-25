package com.eduscrum.awards.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import com.eduscrum.awards.model.Utilizador;
import com.eduscrum.awards.model.UtilizadorDTO;
import com.eduscrum.awards.service.UtilizadorService;

/**
 * Controlador responsável pela gestão de Utilizadores no sistema EduScrum.
 * Este controlador permite obter o utilizador logado,
 * listar todos os utilizadores,
 * criar um novo utilizador e eliminar um utilizador.
 */
@RestController
@RequestMapping("/api/utilizadores")
@CrossOrigin(origins = "*")
public class UtilizadorController {

    @Autowired
    private UtilizadorService utilizadorService;

    // Obter utilizador logado
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        // Verifica se o utilizador está autenticado
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Utilizador não autenticado");
        }

        String email = authentication.getName();

        Utilizador user = utilizadorService.procurarPorEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizador não encontrado"));

        UtilizadorDTO userDTO = new UtilizadorDTO(
                user.getNome(),
                user.getEmail(),
                null,
                user.getPapelSistema());

        return ResponseEntity.ok(userDTO);
    }

    // Endpoint para listar todos os utilizadores
    @GetMapping
    public List<Utilizador> listarTodos() {
        return utilizadorService.listarTodos();
    }

    // Endpoint para criar um novo utilizador
    @PostMapping
    public Utilizador criarUtilizador(@RequestBody UtilizadorDTO utilizadorDTO) {
        return utilizadorService.criarUtilizador(
                utilizadorDTO.getNome(),
                utilizadorDTO.getEmail(),
                utilizadorDTO.getPassword(),
                utilizadorDTO.getPapelSistema());
    }

    // Endpoint para eliminar um utilizador
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        utilizadorService.eliminarUtilizador(id);
    }
}
