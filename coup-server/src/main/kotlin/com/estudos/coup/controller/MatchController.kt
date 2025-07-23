package com.estudos.coup.controller

import com.estudos.coup.controller.response.RoomResponse
import com.estudos.coup.services.MatchService
import org.springframework.messaging.handler.annotation.DestinationVariable
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.handler.annotation.Payload
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Controller

@Controller
class MatchController(private val matchService: MatchService,
                      private val simpMessagingTemplate: SimpMessagingTemplate) {
    @MessageMapping("/state-game")
    fun stateRoom(@Payload roomToken: String){
        val room = matchService.findRoom(roomToken)
        publishRoomState(room = room)
    }

    @MessageMapping("/join-game/{roomToken}")
    fun joinGame(@DestinationVariable roomToken: String, @Payload request: String){
        val playerName = request
        println("Player '$playerName' attempting to join room '$roomToken'")

        val updatedRoom = matchService.enterMatchRoom(roomToken = roomToken, playerName = playerName)
        println("======= INICIO =======")
        println(updatedRoom)
        println("======= FIM =======")
        publishRoomState(updatedRoom)
    }

    private fun publishRoomState(room: RoomResponse){
        val destinationTopic = "/topic/state-room/${room.token}"
        simpMessagingTemplate.convertAndSend(destinationTopic, room)
    }
}
