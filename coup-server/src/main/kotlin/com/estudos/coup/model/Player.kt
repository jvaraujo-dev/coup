package com.estudos.coup.model

import com.estudos.coup.controller.response.PlayerResponse
import com.estudos.coup.controller.response.RoomResponse
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import java.util.UUID
import kotlin.collections.mutableListOf

@Entity
data class Player(
    @Id
    val playerId : String = UUID.randomUUID().toString(),
    val playerName: String,
    val cards: MutableList<CardType> = mutableListOf(),

    @ManyToOne
    var room: Room? = null
){
    constructor() : this(
        playerId = UUID.randomUUID().toString(),
        playerName = "",
        cards = mutableListOf()
    )
}
fun Player.toPlayerResponse(): PlayerResponse{
    return PlayerResponse(
        playerId = this.playerId,
        playerName = this.playerName,
        cards = this.cards.toString(),
        room = this.room?.roomName ?: ""
    )
}
