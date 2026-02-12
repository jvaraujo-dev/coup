package com.estudos.coup.model

import com.estudos.coup.controller.response.ValidRoomResponse
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import java.util.UUID

@Entity
data class Room(
    @Id
    @Column(name = "room_id")
    val token: String = UUID.randomUUID().toString(),
    val name: String,

    var ownerId: String? = null,

    @Enumerated(EnumType.STRING)
    var state: StateRoom = StateRoom.WAITING_PLAYERS,

    @OneToMany(mappedBy = "room",fetch = FetchType.EAGER, cascade = [CascadeType.PERSIST])
    var player: MutableList<Player> = mutableListOf()
){
    constructor() : this(
        token = UUID.randomUUID().toString(),
        name = "",
        state = StateRoom.WAITING_PLAYERS,
        player = mutableListOf()
    )

    override fun toString(): String {
        return "Room(roomName='$name', token='$token')"
    }

    fun setRoomState(stateRoom: StateRoom){
        this.state = stateRoom
    }
}

fun Room.toRoomResponse(): ValidRoomResponse {
    return ValidRoomResponse(
        token = this.token,
        roomName = this.name,
        stateRoom = this.state,
        ownerId = ownerId,
        players = this.player.map { p: Player -> p.toPlayerResponse() }
    )
}
