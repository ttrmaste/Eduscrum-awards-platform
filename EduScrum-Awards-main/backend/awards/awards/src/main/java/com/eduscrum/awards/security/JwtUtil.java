package com.eduscrum.awards.security;

import java.security.Key;
import java.util.Date;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    // Chave secreta para assinar tokens 
    private final Key secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    // Tempo de validade do token 
    private final long expirationTime = 60 * 60 * 1000;

    // Cria um token com base no email do utilizador
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(secretKey)
                .compact();
    }

    // Extrai o email do token
    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    // Verifica se o token ainda é válido
    public boolean isTokenValid(String token) {
        try {
            Claims claims = getClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    // Extrai os dados internos do token
    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}

