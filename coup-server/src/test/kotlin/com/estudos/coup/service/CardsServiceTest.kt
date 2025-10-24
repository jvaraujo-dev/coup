package com.estudos.coup.service

import com.estudos.coup.model.CardType
import com.estudos.coup.model.Player
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import java.util.stream.Stream
import kotlin.test.assertEquals

class CardsServiceTest {

    lateinit var cardsService: CardsService

    @BeforeEach
    fun setUp(){
        cardsService = CardsService()
    }

    @ParameterizedTest
    @MethodSource("inputCardsProvider")
    fun `shoud provide random cards`(expectedCardsAmount: Int, cardsToPick: Int, expectedPlayer: Player) {
        val playerWithCards = cardsService.provideRandomCards(cardsToPick, expectedPlayer)

        assertEquals(expectedCardsAmount, playerWithCards.cards.size)
        assertEquals(expectedPlayer.playerName, playerWithCards.playerName)
    }

    companion object {
        @JvmStatic
        fun inputCardsProvider(): Stream<Arguments> {
            return Stream.of(
                Arguments.of(1, 1,Player(playerName = "Test 1")),
                Arguments.of(2, 2,Player(playerName = "Test 2")),
                Arguments.of(2, 1,Player(playerName = "Test 3", cards = mutableListOf(CardType.CAPITAO)))
            )
        }
    }
}
