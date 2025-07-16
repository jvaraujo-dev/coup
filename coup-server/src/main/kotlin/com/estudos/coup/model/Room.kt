package com.estudos.coup.model

import com.estudos.coup.controller.response.RoomResponse
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import java.util.UUID

@Entity
data class Room(
    @Id
    @Column(name = "room_id")
    val token: String = UUID.randomUUID().toString(),
    val roomName: String,

    @OneToMany(mappedBy = "room",fetch = FetchType.EAGER, cascade = [CascadeType.PERSIST])
    var player: MutableList<Player> = mutableListOf()
){
    constructor() : this(
        token = UUID.randomUUID().toString(),
        roomName = "",
        player = mutableListOf()
    )
}
fun Room.toRoomResponse(): RoomResponse{
    return RoomResponse(
        roomName = this.roomName,
        token = this.token,
        players = this.player
    )
}
