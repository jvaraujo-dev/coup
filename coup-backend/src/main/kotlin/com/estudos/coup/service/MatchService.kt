package com.estudos.coup.service

import com.estudos.coup.controller.request.RoomRequest
import com.estudos.coup.controller.response.RoomResponse
import com.estudos.coup.controller.response.ValidRoomResponse
import com.estudos.coup.model.Player
import com.estudos.coup.model.Room
import com.estudos.coup.model.StateRoom
import com.estudos.coup.model.toRoomResponse
import com.estudos.coup.repository.PlayerRepository
import com.estudos.coup.repository.RoomRepository
import org.springframework.stereotype.Service
import kotlin.jvm.optionals.getOrElse

@Service
class MatchService(
    private val roomRepository: RoomRepository,
    private val playerRepository: PlayerRepository,
    private val cardsService: CardsService) {

fun createRoom(roomParameters: RoomRequest, ownerId: String): Room {
        val newRoom = Room(
            name = roomParameters.roomName,
            ownerId = ownerId
        )
        return roomRepository.save(newRoom)
    }

    fun enterMatchRoom(roomToken: String, playerName:String, playerId: String = "") : RoomResponse {
        val room = roomRepository.findById(roomToken).get()
        var player = playerRepository.findById(playerId).getOrElse { Player(playerName = playerName) }
        println(player.toString())
        val roomError = validateEnterRoom(room, player)

        if (roomError != null) {
            return roomError
        }

        player = cardsService.provideRandomCards(2, player = player)

        return addPlayerToRoom(room, player).toRoomResponse()
    }

    fun startGame(roomToken: String, requesterId: String): ValidRoomResponse{
        val room = roomRepository.findById(roomToken).get()

        if (room.ownerId != requesterId) {
            throw IllegalAccessException("Apenas o dono da sala pode iniciar a partida.")
        }

        val newRoom = Room(token = room.token, name = room.name, state = StateRoom.STARTED, player = room.player)
        roomRepository.save(newRoom)
        return newRoom.toRoomResponse()
    }

    private fun addPlayerToRoom(room: Room, playerToAdd: Player): Room{
        if (!(room.player.contains(playerToAdd))) {
            playerToAdd.room = room
            room.player.add(playerToAdd)

        }

        playerRepository.save(playerToAdd)

        return roomRepository.save(room)
    }

    fun findRoom(roomId: String): ValidRoomResponse{
        return roomRepository.findById(roomId).get().toRoomResponse()
    }
}
