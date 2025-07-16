package com.estudos.coup.controller.response

data class RoomResponse(
    val token: String,
    val roomName: String,
    val players: String?
)
