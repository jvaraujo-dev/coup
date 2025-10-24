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
        val roomRequest = RoomRequest(roomName = roomName)
        val room = Room(roomName = roomName)

        every { matchService.createRoom(any()) } returns room

        val controllerResponse = matchmakingController.createRoom(roomRequest)

        assertEquals(room.player.toString(),controllerResponse.players)
        assertEquals(room.roomName,controllerResponse.roomName)
        assertEquals(room.token,controllerResponse.token)
        verify(exactly = 1) { matchService.createRoom(roomParameters = roomRequest) }
    }
}
