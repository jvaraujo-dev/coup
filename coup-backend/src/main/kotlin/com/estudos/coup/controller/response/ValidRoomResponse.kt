package com.estudos.coup.controller.response

import com.estudos.coup.model.StateRoom

data class ValidRoomResponse(
    override val token: String,
    val roomName: String,
    val stateRoom: StateRoom,
    val players: List<PlayerResponse>
) : RoomResponse {

    fun filterForPlayer(targetPlayerId: String): ValidRoomResponse {
        val filteredPlayers = players.map { player ->
            if (player.playerId == targetPlayerId) {
                player
            } else {
                player.copy(cards = emptyList())
            }
        }
        return this.copy(players = filteredPlayers)
    }
}
