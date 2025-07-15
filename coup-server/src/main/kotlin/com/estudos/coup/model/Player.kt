package com.estudos.coup.model

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
