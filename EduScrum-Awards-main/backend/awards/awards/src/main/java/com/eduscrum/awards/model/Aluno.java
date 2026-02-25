package com.eduscrum.awards.model;

import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.Getter;

@Entity
@Table(name = "aluno")
@PrimaryKeyJoinColumn(name = "id") 
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Aluno extends Utilizador {
    private int totalPontos = 0;

    public void setTotalPontos(int totalPontos) {
        this.totalPontos = totalPontos;
    }

    public int getTotalPontos() {
        return totalPontos;
    }


}
