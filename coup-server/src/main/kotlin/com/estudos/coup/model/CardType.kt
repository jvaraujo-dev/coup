package com.estudos.coup.model

enum class CardType(val displayName: String) {
    DUQUE("Duque"),
    ASSASSINO("Assassino"),
    CONDESSA("Condessa"),
    CAPITAO("Capitão"),
    EMBAIXADOR("Embaixador");

    fun getDescription(): String {
        return when (this) {
            DUQUE -> "Pega 3 moedas do tesouro"
            ASSASSINO -> "Paga 3 moedas para assassinar outro jogador"
            CONDESSA -> "Bloqueia tentativa de assassinato"
            CAPITAO -> "Rouba 2 moedas de outro jogador"
            EMBAIXADOR -> "Troca 2 cartas com o baralho"
        }
    }
}
