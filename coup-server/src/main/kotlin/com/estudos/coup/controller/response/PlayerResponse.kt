package com.estudos.coup.controller.response

data class PlayerResponse(
    val playerId : String,
    val playerName: String,
    val cards: String,

    var room: String = ""
)
