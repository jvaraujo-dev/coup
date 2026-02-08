package com.estudos.coup.service

import com.estudos.coup.controller.request.RoomRequest
import com.estudos.coup.controller.response.ValidRoomResponse
import com.estudos.coup.model.CardType
import com.estudos.coup.model.Player
import com.estudos.coup.model.Room
import com.estudos.coup.model.toRoomResponse
import com.estudos.coup.repository.PlayerRepository
import com.estudos.coup.repository.RoomRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.util.Optional
import kotlin.test.assertEquals

class MatchServiceTest {

    lateinit var roomRepository: RoomRepository
    lateinit var playerRepository: PlayerRepository
    lateinit var cardsService: CardsService

    lateinit var matchService: MatchService

    @BeforeEach
    fun setUp() {
        roomRepository = mockk()
        playerRepository = mockk()
        cardsService = mockk()

        matchService = MatchService(roomRepository, playerRepository, cardsService)
    }

    @Test
    fun `should create and save a room`() {
        val roomName = "Test Room"
        val roomToSave = Room(name = roomName)
        val roomRequest = RoomRequest(roomName = roomName)

        every { roomRepository.save(any())} returns roomToSave

        val result = matchService.createRoom(roomRequest)

        verify(exactly = 0) { playerRepository.save(any()) }
        verify(exactly = 1) { roomRepository.save(any()) }

        assertEquals(roomToSave, result)
    }

    @Test
    fun `should enter an existing room`() {
        val roomName = "Test Room"
        val player = Player(playerName = "Test")
        val room = Room(name = roomName, player = mutableListOf())
        val expectedPlayer = Player(playerId = player.playerId, playerName = player.playerName, cards = mutableListOf(
            CardType.CAPITAO, CardType.CONDESSA), room = room)
        val expectedRoom = Room(token = room.token, name = room.name, player = mutableListOf(expectedPlayer))
            .toRoomResponse()

        every { roomRepository.findById(any()) } returns Optional.of(room)
        every { roomRepository.save(any())} returns room
        every { playerRepository.save(any())} returns player
        every { playerRepository.findById(any())} returns Optional.empty()
        every { cardsService.provideRandomCards(any(), any()) } returns expectedPlayer

        val result = matchService.enterMatchRoom(roomToken = room.token, playerName = player.playerName)

        verify(exactly = 1) { roomRepository.save(any()) }
        verify(exactly = 1) { playerRepository.save(any()) }

        assertEquals(expectedRoom.players, result.players)
        assertEquals(expectedRoom.token, result.token)
        assertEquals(expectedRoom.roomName, result.roomName)
    }

    @Test
    fun `should not enter if the player already in room`() {
        val roomName = "Test Room"
        val player = Player(playerName = "Test", cards = mutableListOf(CardType.CAPITAO, CardType.CONDESSA))
        val room = Room(name = roomName, player = mutableListOf(player))
        val expectedPlayer = Player(playerId = player.playerId, playerName = player.playerName, cards = mutableListOf(
            CardType.CAPITAO, CardType.CONDESSA), room = room)
        val expectedRoom = Room(token = room.token, name = room.name, player = mutableListOf(expectedPlayer))

        every { roomRepository.findById(any()) } returns Optional.of(expectedRoom)
        every { roomRepository.save(any())} returns expectedRoom
        every { playerRepository.save(any())} returns player
        every { playerRepository.findById(any())} returns Optional.of(expectedPlayer)
        every { cardsService.provideRandomCards(any(), any()) } returns expectedPlayer

        val result = matchService.enterMatchRoom(roomToken = room.token, playerName = player.playerName)

        verify(exactly = 1) { roomRepository.save(any()) }
        verify(exactly = 1) { playerRepository.save(any()) }

        val roomAssert = expectedRoom.toRoomResponse()

        assertEquals(roomAssert.players, result.players)
        assertEquals(roomAssert.token, result.token)
        assertEquals(roomAssert.roomName, result.roomName)
    }

    @Test
    fun `should find an existing room`() {
        val roomName = "Test Room"
        val room = Room(name = roomName)
        val expectedRoom = room.toRoomResponse()

        every { roomRepository.findById(any()) } returns Optional.of(room)

        val result = matchService.findRoom(roomId = room.token)

        verify(exactly = 1) { roomRepository.findById(any()) }

        assertEquals(expectedRoom.token, result.token)
        assertEquals(expectedRoom.roomName, result.roomName)
        assertEquals(expectedRoom.players, result.players)
    }
}
