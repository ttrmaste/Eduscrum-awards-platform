package com.eduscrum.awards.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.eduscrum.awards.model.Admin;
import com.eduscrum.awards.model.Aluno;
import com.eduscrum.awards.model.PapelSistema;
import com.eduscrum.awards.model.Professor;
import com.eduscrum.awards.model.Utilizador;
import com.eduscrum.awards.model.UtilizadorDTO;
import com.eduscrum.awards.repository.UtilizadorRepository;
import com.eduscrum.awards.security.JwtUtil;

/**
 * Controlador responsável pela gestão de autenticação no sistema EduScrum.
 * Este controlador permite efetuar login e registro de utilizadores,
 * bem como gerir tokens de autenticação.
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UtilizadorRepository utilizadorRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;

    // MODELOS DOS PEDIDOS
    public static class LoginRequest {
        public String email;
        public String password;
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        Optional<Utilizador> userOpt = utilizadorRepository.findByEmail(request.email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Email não encontrado");
        }

        Utilizador user = userOpt.get();

        if (!passwordEncoder.matches(request.password, user.getPasswordHash())) {
            return ResponseEntity.status(401).body("Senha incorreta");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return ResponseEntity.ok(Map.of(
                "token", token,
                "id", user.getId(),
                "nome", user.getNome(),
                "email", user.getEmail(),
                "papelSistema", user.getPapelSistema().name()));
    }

    // REGISTO
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UtilizadorDTO novoDTO) {

        if (utilizadorRepository.findByEmail(novoDTO.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email já registado");
        }

        if (novoDTO.getPassword() == null || novoDTO.getPassword().isEmpty()) {
            return ResponseEntity.badRequest().body("Password é obrigatória");
        }

        String passwordHash = passwordEncoder.encode(novoDTO.getPassword());
        PapelSistema papel = novoDTO.getPapelSistema() != null ? novoDTO.getPapelSistema() : PapelSistema.ALUNO;

        Utilizador novoUser;

        switch (papel) {
            case ALUNO -> {
                Aluno aluno = new Aluno();
                aluno.setNome(novoDTO.getNome());
                aluno.setEmail(novoDTO.getEmail());
                aluno.setPasswordHash(passwordHash);
                aluno.setPapelSistema(PapelSistema.ALUNO);
                novoUser = aluno;
            }
            case PROFESSOR -> {
                Professor prof = new Professor();
                prof.setNome(novoDTO.getNome());
                prof.setEmail(novoDTO.getEmail());
                prof.setPasswordHash(passwordHash);
                prof.setPapelSistema(PapelSistema.PROFESSOR);
                novoUser = prof;
            }
            case ADMIN -> {
                Admin admin = new Admin();
                admin.setNome(novoDTO.getNome());
                admin.setEmail(novoDTO.getEmail());
                admin.setPasswordHash(passwordHash);
                admin.setPapelSistema(PapelSistema.ADMIN);
                novoUser = admin;
            }
            default -> {
                Utilizador u = new Utilizador();
                u.setNome(novoDTO.getNome());
                u.setEmail(novoDTO.getEmail());
                u.setPasswordHash(passwordHash);
                u.setPapelSistema(papel);
                novoUser = u;
            }
        }

        Utilizador saved = utilizadorRepository.save(novoUser);
        String token = jwtUtil.generateToken(saved.getEmail());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "id", saved.getId(),
                "nome", saved.getNome(),
                "email", saved.getEmail(),
                "papelSistema", saved.getPapelSistema().name()));
    }
}
