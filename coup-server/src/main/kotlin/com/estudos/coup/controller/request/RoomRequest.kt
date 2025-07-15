package com.estudos.coup.controller.request

import com.estudos.coup.model.Player

data class RoomRequest(val roomName: String, val players: List<Player>?)
