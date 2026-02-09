package com.estudos.coup.controller.response

import com.estudos.coup.model.CardType

data class PlayerResponse(
    val playerId : String,
    val playerName: String,
    val cards: List<CardType> = emptyList(),

    var room: String = ""
)
