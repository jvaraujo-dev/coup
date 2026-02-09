package com.estudos.coup.controller

import com.estudos.coup.controller.response.RoomResponse
import com.estudos.coup.controller.response.ValidRoomResponse
import com.estudos.coup.service.MatchService
import org.springframework.messaging.handler.annotation.DestinationVariable
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.handler.annotation.Payload
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = ["\${cors.allowed-origins}"])
class MatchController(
    private val matchService: MatchService,
    private val simpMessagingTemplate: SimpMessagingTemplate
) {

    @PostMapping("/{roomToken}/join")
    fun joinRoomHTTP(@PathVariable roomToken: String, @RequestBody request: Map<String, String>): Map<String, String> {
        val playerName = request["playerName"] ?: throw IllegalArgumentException("Nome do jogador é obrigatório")

        val roomResponse = matchService.enterMatchRoom(roomToken = roomToken, playerName = playerName)

        publishRoomState(roomResponse)

        val playerId = (roomResponse as? ValidRoomResponse)?.players
            ?.find { it.playerName == playerName }?.playerId
            ?: error("Erro ao recuperar ID do jogador")

        return mapOf("playerId" to playerId)
    }

    @MessageMapping("/state-game")
    fun stateRoom(@Payload roomToken: String){
        val room = matchService.findRoom(roomToken)
        publishRoomState(room = room)
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
