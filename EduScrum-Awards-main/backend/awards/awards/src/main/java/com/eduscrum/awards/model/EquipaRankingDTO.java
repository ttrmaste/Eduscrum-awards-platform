package com.eduscrum.awards.model;

public class EquipaRankingDTO {
    private Long idEquipa;
    private String nomeEquipa;
    private int totalPontosMembros;
    private double mediaPontos;

    public EquipaRankingDTO(Long idEquipa, String nomeEquipa, int totalPontosMembros, double mediaPontos) {
        this.idEquipa = idEquipa;
        this.nomeEquipa = nomeEquipa;
        this.totalPontosMembros = totalPontosMembros;
        this.mediaPontos = mediaPontos;
    }

    // Getters
    public Long getIdEquipa() {
        return idEquipa;
    }

    public String getNomeEquipa() {
        return nomeEquipa;
    }

    public int getTotalPontosMembros() {
        return totalPontosMembros;
    }

    public double getMediaPontos() {
        return mediaPontos;
    }
}