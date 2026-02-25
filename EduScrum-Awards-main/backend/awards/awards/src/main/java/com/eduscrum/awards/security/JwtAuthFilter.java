package com.eduscrum.awards.security;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.eduscrum.awards.repository.UtilizadorRepository;

import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired private JwtUtil jwtUtil;
    @Autowired private UtilizadorRepository utilizadorRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        String path = request.getRequestURI();


        // Ignora apenas endpoints de autenticação
        if (path.startsWith("/api/auth")) {
            System.out.println("Public endpoint - skipping authentication");
            filterChain.doFilter(request, response);
            return;
        }

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            System.out.println("Token extracted: " + token.substring(0, Math.min(20, token.length())) + "...");

            try {
                String email = jwtUtil.extractEmail(token);
                System.out.println("Email from token: " + email);

                if (jwtUtil.isTokenValid(token) && SecurityContextHolder.getContext().getAuthentication() == null) {
                    utilizadorRepository.findByEmail(email).ifPresent(user -> {
                        System.out.println("User found: " + user.getEmail() + " - Role: " + user.getPapelSistema());
                        
                        List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                            new SimpleGrantedAuthority("ROLE_" + user.getPapelSistema())
                        );

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        new User(user.getEmail(), user.getPasswordHash(), authorities),
                                        null,
                                        authorities
                                );
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        System.out.println("Authentication set successfully with role: ROLE_" + user.getPapelSistema());
                    });
                }
            } catch (ExpiredJwtException e) {
                System.out.println("Token expired");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Token expirado");
                return;
            } catch (Exception e) {
                System.out.println("Token validation error: " + e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Token inválido");
                return;
            }
        } else {
            System.out.println("No valid Authorization header found");
        }

        System.out.println("=== End JWT Filter ===");
        filterChain.doFilter(request, response);
    }
}