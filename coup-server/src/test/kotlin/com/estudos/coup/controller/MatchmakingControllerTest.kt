package com.estudos.coup.controller

import com.estudos.coup.controller.request.RoomRequest
import com.estudos.coup.model.Player
import com.estudos.coup.model.Room
import com.estudos.coup.service.MatchService
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import kotlin.test.assertEquals

class MatchmakingControllerTest {

    lateinit var matchService: MatchService

    lateinit var matchmakingController: MatchmakingController

    @BeforeEach
    fun setUp()  {
        matchService = mockk()

        matchmakingController = MatchmakingController(matchService)
    }

    @Test
    fun shouldCreateARoomWithoutPlayers() {
        val roomName = "Test room name"
        val roomRequest = RoomRequest(roomName = roomName, players = null)
        val room = Room(roomName = roomName)

        every { matchService.createRoom(any()) } returns room

        val controllerResponse = matchmakingController.createRoom(roomRequest)

        assertEquals(room.player.toString(),controllerResponse.players)
        assertEquals(room.roomName,controllerResponse.roomName)
        assertEquals(room.token,controllerResponse.token)
        verify(exactly = 1) { matchService.createRoom(roomName = roomRequest.roomName) }
    }

    @ParameterizedTest
    @MethodSource("playersProvider")
    fun shouldCreateARoomWithVariousPlayers(players: MutableList<Player>) {
        val roomName = "Test room name"
        val roomRequest = RoomRequest(roomName = roomName, players = players)
        val room = Room(roomName = roomName, player = players)

        every { matchService.createRoom(any()) } returns room

        val controllerResponse = matchmakingController.createRoom(roomRequest)

        assertEquals(room.player.toString(),controllerResponse.players)
        assertEquals(room.roomName,controllerResponse.roomName)
        assertEquals(room.token,controllerResponse.token)
        verify(exactly = 1) { matchService.createRoom(roomName = roomRequest.roomName) }
    }

    companion object {
        @JvmStatic
        fun playersProvider(): List<Arguments> {
            return listOf(
                Arguments.of(listOf(Player(playerName = "Player 1"))),
                Arguments.of(listOf(Player(playerName = "Player 1"), Player(playerName = "Player 2"))),
                Arguments.of(listOf(Player(playerName = "Player 1"), Player(playerName = "Player 2"), Player(playerName = "Player 3")))
            )
        }
    }
}