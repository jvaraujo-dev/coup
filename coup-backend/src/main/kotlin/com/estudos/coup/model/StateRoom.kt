package com.estudos.coup.model

enum class StateRoom(val description: String) {
    WAITING_PLAYERS("Aguardando jogadores"),
    WAITING_START("Aguardando inicio do jogo"),
    STARTED("Jogo iniciado"),
    FINALIZED("Jogo finalizado")
}
