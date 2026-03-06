package com.estudos.coup.controller

import com.estudos.coup.controller.response.PlayerResponse
import com.estudos.coup.controller.response.ValidRoomResponse
import com.estudos.coup.model.CardType
import com.estudos.coup.model.StateRoom
import com.estudos.coup.service.MatchService
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.messaging.simp.SimpMessagingTemplate
import java.util.UUID

class MatchControllerTests {

    private lateinit var matchService: MatchService
    private lateinit var simpMessagingTemplate: SimpMessagingTemplate

    private lateinit var controller: MatchController

    @BeforeEach
    fun setUp() {
        matchService = mockk()
        simpMessagingTemplate = mockk()

        controller = MatchController(matchService, simpMessagingTemplate)
    }

    @Test
    fun shouldPublishRoomStateWithValidPlayers(){
        val tokenRoom = "abb0a758-64fe-4d01-bc9a-7ad8e821e06b"
        val roomName = "Test state-game"
        val ownerId = UUID.randomUUID().toString()
        val players = listOf(
            PlayerResponse(
                playerId = "77b522a9-f853-4f5f-aac8-006d920a3d1e",
                playerName = "Player 1",
                cards = mutableListOf(CardType.ASSASSINO, CardType.EMBAIXADOR)
            )
        )
        val expectedTopic = "/topic/state-room/$tokenRoom/${players[0].playerId}"

        val roomState = StateRoom.WAITING_PLAYERS
        val room = ValidRoomResponse(
            token = tokenRoom,
            roomName = roomName,
            players = players,
            stateRoom = roomState,
            ownerId = ownerId)

        every { matchService.findRoom(any()) } returns room
        every { simpMessagingTemplate.convertAndSend(any(), any<String>()) } returns mockk()

        controller.stateRoom(tokenRoom)

        verify { simpMessagingTemplate.convertAndSend(
            expectedTopic,
            eq(room)) }
    }

    @Test
    fun shouldJoinAnExistentRoom(){
        val tokenRoom = "abb0a758-64fe-4d01-bc9a-7ad8e821e06b"
        val roomName = "Test state-game"
        val playerName = "Player 1"
        val ownerId = UUID.randomUUID().toString()
        val players = listOf(
            PlayerResponse(
                playerId = "77b522a9-f853-4f5f-aac8-006d920a3d1e",
                playerName = "Player 1",
                cards = mutableListOf(CardType.ASSASSINO, CardType.EMBAIXADOR)
            )
        )
        val roomState = StateRoom.WAITING_PLAYERS
        val room = ValidRoomResponse(
            token = tokenRoom,
            roomName = roomName,
            players = players,
            stateRoom = roomState,
            ownerId = ownerId)

        every { matchService.enterMatchRoom(any(),any()) } returns room
        every { simpMessagingTemplate.convertAndSend(any(), any<String>()) } returns mockk()

        controller.joinRoomHTTP(tokenRoom, mapOf("playerName" to playerName))

        verify { matchService.enterMatchRoom(eq(tokenRoom), eq(playerName)) }
    }
}
