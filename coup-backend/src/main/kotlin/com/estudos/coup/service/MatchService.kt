package com.estudos.coup.service

import com.estudos.coup.controller.request.RoomRequest
import com.estudos.coup.controller.response.RoomResponse
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

fun createRoom(roomParameters: RoomRequest): Room {
        val newRoom = Room(name = roomParameters.roomName)
        return roomRepository.save(newRoom)
    }

    fun enterMatchRoom(roomToken: String, playerName:String, playerId: String = "") : RoomResponse{
        val room = roomRepository.findById(roomToken).get()
        var player = playerRepository.findById(playerId).getOrElse { Player(playerName = playerName) }

        player = cardsService.provideRandomCards(2, player = player)

        return addPlayerToRoom(room, player).toRoomResponse()
    }

    fun startGame(roomToken: String): RoomResponse{
        val room = roomRepository.findById(roomToken).get()
        val newRoom = Room(token = room.token, name = room.name, state = StateRoom.STARTED, player = room.player)
        roomRepository.save(newRoom)
        return newRoom.toRoomResponse()
    }

    private fun addPlayerToRoom(room: Room, playerToAdd: Player): Room{
        if (!(room.player.contains(playerToAdd))) {
            playerToAdd.room = room
            room.player.add(playerToAdd)

        }

//        println("Player with ID $playerToAdd is in Room ${room.token}.")

        playerRepository.save(playerToAdd)

        return roomRepository.save(room)
    }

    fun findRoom(roomId: String): RoomResponse{
        return roomRepository.findById(roomId).get().toRoomResponse()
    }
}
