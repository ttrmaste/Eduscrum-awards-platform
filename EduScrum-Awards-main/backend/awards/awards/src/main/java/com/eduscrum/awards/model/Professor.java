package com.eduscrum.awards.model;

import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.Getter;


@Entity
@Table(name = "professor")
@PrimaryKeyJoinColumn(name = "id") 
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Professor extends Utilizador {
    private String departamento;

    public void setDepartamento(String departamento) {
        this.departamento = departamento;
    }
}
