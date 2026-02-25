package com.eduscrum.awards.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eduscrum.awards.model.Aluno;
import com.eduscrum.awards.model.PapelSistema;
import com.eduscrum.awards.model.Professor;
import com.eduscrum.awards.model.Admin;
import com.eduscrum.awards.model.Utilizador;
import com.eduscrum.awards.repository.AlunoRepository;
import com.eduscrum.awards.repository.ProfessorRepository;
import com.eduscrum.awards.repository.UtilizadorRepository;
import com.eduscrum.awards.repository.AdminRepository;

/**
 * Serviço responsável pela gestão de Utilizadores no sistema EduScrum.
 * Este serviço permite criar, listar, atualizar e eliminar utilizadores,
 * bem como consultar utilizadores por email.
 */
@Service
public class UtilizadorService {

    private final UtilizadorRepository utilizadorRepository;
    private final AlunoRepository alunoRepository;
    private final ProfessorRepository professorRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UtilizadorService(UtilizadorRepository utilizadorRepository, AlunoRepository alunoRepository,
            ProfessorRepository professorRepository, AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.utilizadorRepository = utilizadorRepository;
        this.alunoRepository = alunoRepository;
        this.professorRepository = professorRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Utilizador> listarTodos() {
        return utilizadorRepository.findAll();
    }

    public Optional<Utilizador> procurarPorEmail(String email) {
        return utilizadorRepository.findByEmail(email);
    }

    @Transactional
    public Utilizador criarUtilizador(String nome, String email, String password, PapelSistema papelSistema) {

        // validação do email
        if (utilizadorRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email já registado: " + email);
        }

        // gerar hash seguro da password
        String hashedPassword = passwordEncoder.encode(password);

        System.out.println("A criar utilizador do tipo: " + papelSistema); // Log para debug

        // guardar diretamente a subclasse quando aplicável
        switch (papelSistema) {
            case ALUNO -> {
                Aluno a = new Aluno();
                a.setNome(nome);
                a.setEmail(email);
                a.setPasswordHash(hashedPassword);
                a.setPapelSistema(PapelSistema.ALUNO);
                return alunoRepository.save(a);
            }
            case PROFESSOR -> {
                Professor p = new Professor();
                p.setNome(nome);
                p.setEmail(email);
                p.setPasswordHash(hashedPassword);
                p.setPapelSistema(PapelSistema.PROFESSOR);
                return professorRepository.save(p);
            }
            case ADMIN -> {
                Admin admin = new Admin();
                admin.setNome(nome);
                admin.setEmail(email);
                admin.setPasswordHash(hashedPassword);
                admin.setPapelSistema(PapelSistema.ADMIN);
                return adminRepository.save(admin);
            }
            default -> {
                Utilizador u = new Utilizador();
                u.setNome(nome);
                u.setEmail(email);
                u.setPasswordHash(hashedPassword);
                u.setPapelSistema(papelSistema);
                return utilizadorRepository.save(u);
            }
        }
    }

    public void eliminarUtilizador(Long id) {
        utilizadorRepository.deleteById(id);
    }
}