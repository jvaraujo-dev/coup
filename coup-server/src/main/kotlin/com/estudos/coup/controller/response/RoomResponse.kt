package com.estudos.coup.controller.response

import com.estudos.coup.model.Player

data class RoomResponse(
    val token: String,
    val roomName: String,
    val players: MutableList<Player>?
)
