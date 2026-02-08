package com.estudos.coup.service

import com.estudos.coup.controller.response.ErrorRoomResponse
import com.estudos.coup.controller.response.RoomResponse
import com.estudos.coup.model.Room
import com.estudos.coup.model.StateRoom

fun validateEnterRoom(room: Room) : RoomResponse? {

    if(room.state != StateRoom.WAITING_PLAYERS){
        return ErrorRoomResponse("Jogo já iniciado, não é possivel adicionar mais jogadores")
    }

    return null
}