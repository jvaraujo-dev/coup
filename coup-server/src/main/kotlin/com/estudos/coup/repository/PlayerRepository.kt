package com.estudos.coup.repository

import com.estudos.coup.model.Player
import org.springframework.data.jpa.repository.JpaRepository

interface PlayerRepository : JpaRepository<Player, String> {
}