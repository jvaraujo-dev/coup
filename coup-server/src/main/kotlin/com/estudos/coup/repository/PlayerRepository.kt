package com.estudos.coup.repository

import com.estudos.coup.model.Player
import org.springframework.data.jpa.repository.JpaRepository

@Suppress("EmptyClassBlock")
interface PlayerRepository : JpaRepository<Player, String> {
}
