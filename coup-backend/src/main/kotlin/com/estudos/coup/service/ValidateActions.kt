package com.estudos.coup.service

import com.estudos.coup.controller.response.ErrorRoomResponse
import com.estudos.coup.controller.response.RoomResponse
import com.estudos.coup.model.Player
import com.estudos.coup.model.Room
import com.estudos.coup.model.StateRoom

fun validateEnterRoom(room: Room, player: Player?) : RoomResponse? {

    val isPlayerInRoom = player != null && room.player.any { it.playerId == player.playerId }

    if(room.state != StateRoom.WAITING_PLAYERS && !isPlayerInRoom) {
        return ErrorRoomResponse(
            error = "Jogo já iniciado, não é possivel adicionar mais jogadores",
            token = room.token
        )
    }

    return null
}
