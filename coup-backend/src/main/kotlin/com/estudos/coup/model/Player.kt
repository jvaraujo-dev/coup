package com.estudos.coup.model

import com.estudos.coup.controller.response.PlayerResponse
import jakarta.persistence.CollectionTable
import jakarta.persistence.Column
import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
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

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "player_cards", joinColumns = [JoinColumn(name = "player_id")])
    @Column(name = "card")
    @Enumerated(EnumType.STRING)
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
fun Player.toPlayerResponse(): PlayerResponse {
    return PlayerResponse(
        playerId = this.playerId,
        playerName = this.playerName,
        cards = this.cards.toMutableList(),
        room = this.room?.token ?: ""
    )
}
