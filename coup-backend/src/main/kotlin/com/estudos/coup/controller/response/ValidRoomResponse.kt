package com.estudos.coup.controller.response

data class ValidRoomResponse(
    override val token: String,
    val roomName: String,
    val players: String?,
    val stateRoom: String
) : RoomResponse
