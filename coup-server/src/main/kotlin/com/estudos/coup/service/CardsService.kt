package com.estudos.coup.service

import com.estudos.coup.model.CardType
import com.estudos.coup.model.Player
import org.springframework.stereotype.Service
import kotlin.random.Random

@Service
class CardsService {

    fun provideRandomCards(cardsAmount: Int, player: Player): Player{
        val allCardTypes = CardType.entries
        repeat(cardsAmount){
            player.cards.add(allCardTypes.random(Random))
        }
        return player
    }
}
