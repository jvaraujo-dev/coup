package com.estudos.coup.services

import com.estudos.coup.controller.response.RoomResponse
import com.estudos.coup.model.CardType
import com.estudos.coup.model.Player
import com.estudos.coup.model.Room
import com.estudos.coup.model.toRoomResponse
import com.estudos.coup.repository.PlayerRepository
import com.estudos.coup.repository.RoomRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import kotlin.jvm.optionals.getOrElse
import kotlin.random.Random

@Service
class MatchService(private val roomRepository: RoomRepository, private val playerRepository: PlayerRepository) {
    fun createRoom(roomName: String, players: MutableList<Player> = mutableListOf()): Room {
        val newRoom = Room(roomName = roomName, player = players)
        roomRepository.save(newRoom)
        return newRoom
    }

    fun enterMatchRoom(roomToken: String, playerName:String, playerId: String = "") : RoomResponse{
        val room = roomRepository.findById(roomToken).get()
        val player = playerRepository.findById(playerId).getOrElse { Player(playerName = playerName) }
        provideRandomCards(2, player = player)
        playerRepository.save(player)
        return addPlayerToRoom(room, player).toRoomResponse()
    }

    private fun provideRandomCards(cardsAmount: Int, player: Player){
        val allCardTypes = CardType.entries
        repeat(cardsAmount){
            player.cards.add(allCardTypes.random(Random))
        }
    }
    fun findRoom(roomId: String): RoomResponse{
        return roomRepository.findById(roomId).get().toRoomResponse()
    }

    @Transactional
    private fun addPlayerToRoom(room: Room, playerToAdd: Player): Room{
        if (!(room.player.contains(playerToAdd))) {
            playerToAdd.room = room
            room.player.add(playerToAdd)
        } else {
            println("Player with ID $playerToAdd is already in Room ${room.token}.")
        }
        playerRepository.save(playerToAdd)
        return roomRepository.save(room)
    }
}