package com.estudos.coup.controller.response

data class ErrorRoomResponse(
    val error: String,
    override val token: String,
): RoomResponse
