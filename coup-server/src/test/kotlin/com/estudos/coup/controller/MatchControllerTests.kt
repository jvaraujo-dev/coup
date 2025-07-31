package com.estudos.coup.controller

import com.estudos.coup.controller.response.RoomResponse
import com.estudos.coup.services.MatchService
import io.mockk.Runs
import io.mockk.every
import io.mockk.just
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.messaging.simp.SimpMessagingTemplate

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
    fun shouldPublishRoomStateWithoutPlayers(){
        val tokenRoom = "abb0a758-64fe-4d01-bc9a-7ad8e821e06b"
        val roomName = "Test state-game"
        val room = RoomResponse(tokenRoom, roomName, "[]")

        every { matchService.findRoom(any()) } returns room
        every { simpMessagingTemplate.convertAndSend(any(), any<String>()) } returns mockk()

        controller.stateRoom(tokenRoom)
        verify { simpMessagingTemplate.convertAndSend(any(), eq(room)) }
    }

    @Test
    fun shouldPublishRoomStateWithValidPlayers(){
        val tokenRoom = "abb0a758-64fe-4d01-bc9a-7ad8e821e06b"
        val roomName = "Test state-game"
        val players = "[Player(playerId=77b522a9-f853-4f5f-aac8-006d920a3d1e, playerName=Player 1, cards=[ASSASSINO, EMBAIXADOR], room=Room(roomName=$roomName, token=$tokenRoom))]"
        val room = RoomResponse(tokenRoom, roomName, players)

        every { matchService.findRoom(any()) } returns room
        every { simpMessagingTemplate.convertAndSend(any(), any<String>()) } returns mockk()

        controller.stateRoom(tokenRoom)

        verify { simpMessagingTemplate.convertAndSend(any(), eq(room)) }
    }

    @Test
    fun shouldJoinAnExistentRoom(){
        val tokenRoom = "abb0a758-64fe-4d01-bc9a-7ad8e821e06b"
        val roomName = "Test state-game"
        val playerName = "Player 1"
        val players = "[Player(playerId=77b522a9-f853-4f5f-aac8-006d920a3d1e, playerName=Player 1, cards=[ASSASSINO, EMBAIXADOR], room=Room(roomName=$roomName, token=$tokenRoom))]"
        val room = RoomResponse(tokenRoom, roomName, players)

        every { matchService.enterMatchRoom(any(),any()) } returns room

        controller.joinGame(tokenRoom, playerName)

        verify { matchService.enterMatchRoom(eq(tokenRoom), eq(playerName)) }
    }
}