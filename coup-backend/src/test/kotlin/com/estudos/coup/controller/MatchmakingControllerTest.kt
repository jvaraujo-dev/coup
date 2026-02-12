package com.estudos.coup.controller

import com.estudos.coup.controller.request.RoomRequest
import com.estudos.coup.model.Room
import com.estudos.coup.service.MatchService
import io.mockk.Runs
import io.mockk.every
import io.mockk.just
import io.mockk.mockk
import io.mockk.verify
import jakarta.servlet.http.HttpServletResponse
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.util.UUID
import kotlin.test.assertEquals

class MatchmakingControllerTest {

    lateinit var matchService: MatchService

    lateinit var matchmakingController: MatchmakingController

    @BeforeEach
    fun setUp()  {
        matchService = mockk()
        val servletResponse = mockk<HttpServletResponse>()

        matchmakingController = MatchmakingController(matchService)
    }

    @Test
    fun shouldCreateARoomWithOwner() {
        val roomName = "Test room name"
        val ownerId = UUID.randomUUID().toString()
        val servletResponse = mockk<HttpServletResponse>()
        val roomRequest = RoomRequest(roomName = roomName)
        val room = Room(
            name = roomName,
            ownerId = ownerId,
        )

        every { matchService.createRoom(any(), any()) } returns room
        every { servletResponse.addCookie(any()) } just Runs

        val controllerResponse = matchmakingController.createRoom(
            roomParameters = roomRequest,
            response = servletResponse,
            sessionCookie = ownerId
            )

        assertEquals(room.player.toString(),controllerResponse.players.toString())
        assertEquals(room.name,controllerResponse.roomName)
        assertEquals(room.token,controllerResponse.token)
        verify(exactly = 1) { matchService.createRoom(
            roomParameters = roomRequest,
            ownerId = ownerId,
        ) }
    }
}
