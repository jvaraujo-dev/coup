package com.estudos.coup.service

import com.estudos.coup.model.Player
import com.estudos.coup.model.Room
import com.estudos.coup.repository.PlayerRepository
import com.estudos.coup.repository.RoomRepository
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import java.util.Optional
import kotlin.collections.mutableListOf

class MatchServiceTest {

    lateinit var roomRepository: RoomRepository
    lateinit var playerRepository: PlayerRepository

    lateinit var matchService: MatchService

    @BeforeEach
    fun setUp() {
        roomRepository = mockk()
        playerRepository = mockk()

        matchService = MatchService(roomRepository, playerRepository)
    }

    @ParameterizedTest
    @MethodSource("providePlayers")
    fun shouldCreateRoomWithAListOfNewPlayers(expectedPlayers: MutableList<Player>) {
        val roomName = "Test Room"
        val room = Room(roomName = roomName, player = expectedPlayers)

        every { roomRepository.findById(any()) } returns Optional.of(room)
        every { roomRepository.save(any())} returns room
        every { playerRepository.findById(any()) } returns Optional.empty()
        every { playerRepository.save(any()) } answers { invocation.args[0] as Player }
//        every { playerRepository.save(expectedPlayers[0]) } returns expectedPlayers[0]
//        every { playerRepository.save(expectedPlayers[1]) } returns expectedPlayers[1]

        matchService.createRoom(roomName, expectedPlayers)
//        verify(exactly = 2) { playerRepository.save(any()) }
    }

    companion object {
        @JvmStatic
        fun providePlayers(): List<Arguments>{
            return listOf(
                Arguments.of(mutableListOf(Player(playerName = "Player 1"), Player(playerName = "Player 2"))),
            )
        }
    }
}