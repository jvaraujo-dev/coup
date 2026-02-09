package com.estudos.coup.controller

import com.estudos.coup.controller.response.RoomResponse
import com.estudos.coup.controller.response.ValidRoomResponse
import com.estudos.coup.service.MatchService
import org.springframework.messaging.handler.annotation.DestinationVariable
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.handler.annotation.Payload
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Controller

@Controller
class MatchController(
    private val matchService: MatchService,
    private val simpMessagingTemplate: SimpMessagingTemplate
) {

    @MessageMapping("/state-game")
    fun stateRoom(@Payload roomToken: String){
        val room = matchService.findRoom(roomToken)
        publishRoomState(room = room)
    }

    @MessageMapping("/{roomToken}/join-game")
    fun joinGame(@DestinationVariable roomToken: String, @Payload request: String){
        val updatedRoom = matchService.enterMatchRoom(roomToken = roomToken, playerName = request)
        publishRoomState(updatedRoom)
    }

    @MessageMapping("/{roomToken}/start")
    fun startGame(@DestinationVariable roomToken: String){
        val updatedRoom = matchService.startGame(roomToken= roomToken)
        publishRoomState(updatedRoom)
    }

    private fun publishRoomState(room: RoomResponse){
        if (room is ValidRoomResponse) {
            room.players.forEach { player ->
                val filteredState = room.filterForPlayer(player.playerId)

                val destination = "/topic/state-room/${room.token}/${player.playerId}"
                simpMessagingTemplate.convertAndSend(destination, filteredState)
            }
        }
    }
}