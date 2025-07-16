package com.estudos.coup.controller.response

import com.estudos.coup.model.CardType
import com.estudos.coup.model.Room
import jakarta.persistence.Id
import jakarta.persistence.ManyToOne
import java.util.UUID

data class PlayerResponse(
    val playerId : String,
    val playerName: String,
    val cards: String,

    var room: String = ""
)
