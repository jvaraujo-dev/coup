package com.estudos.coup.controller.response

data class ValidRoomResponse(
    override val token: String,
    val roomName: String,
    val players: List<PlayerResponse>,
    val stateRoom: String
) : RoomResponse{
    fun filterForPlayer(targetPlayerId: String): ValidRoomResponse {
        val filteredPlayers = players.map { player ->
            if (player.playerId == targetPlayerId) {
                player // Mantém as cartas se for o próprio jogador
            } else {
                player.copy(cards = emptyList()) // Oculta as cartas dos adversários
            }
        }
        return this.copy(players = filteredPlayers)
    }
}
