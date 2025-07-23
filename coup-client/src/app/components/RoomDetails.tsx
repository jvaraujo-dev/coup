'use client';

import React from 'react';
import {PlayerState, RoomDetailsProps} from '../types'

const RoomDetails: React.FC<RoomDetailsProps> = ({
                                                     roomState,
                                                     roomToken,
                                                     playerNameInput,
                                                     setPlayerNameInput,
                                                     handleJoinGame,
                                                     handleLeaveRoom,
                                                 }) => {

    let playersTableRows;

    if (roomState?.players && roomState.players.length > 0) {
        playersTableRows = roomState.players.map((player: PlayerState) => {
            const cards = player.cards.toString().split(",").slice(0, 2)
            const cardsDisplay = player.cards.length > 0
                ? cards.join(", ")
                : 'Sem cartas';

            return (
                <tr key={player.playerId}>
                    <td>{player.playerName}</td>
                    <td>{cardsDisplay}</td>
                </tr>
            );
        });
    } else {
        // Se não houver jogadores, exibe uma mensagem na tabela
        playersTableRows = (
            <tr>
                <td colSpan={2}>Nenhum jogador nesta sala ainda.</td>
            </tr>
        );
    }
    // --- Fim da Lógica JavaScript Separada ---

    return (
        <>
            <h2>Sala Atual: <span id="currentRoomToken">{roomState?.roomName || 'Carregando...'}</span></h2>
            <p>Token da Sala: <strong>{roomToken}</strong></p>

            <div className="form-group" style={{ marginBottom: '20px' }}>
                <label htmlFor="playerName">Seu Nome:</label>
                <input
                    type="text"
                    id="playerName"
                    className="form-control"
                    placeholder="Seu nome aqui..."
                    value={playerNameInput}
                    onChange={(e) => setPlayerNameInput(e.target.value)}
                />
                <button onClick={handleJoinGame} className="btn btn-success" style={{ marginLeft: '10px' }}>
                    Entrar no Jogo
                </button>
            </div>

            <button onClick={handleLeaveRoom} className="btn btn-warning" type="button">
                Sair da Sala
            </button>
            <hr />

            <h3>Jogadores na Sala:</h3>
            <table className="table table-striped">
                <thead>
                <tr>
                    <th>Nome do Jogador</th>
                    <th>Cartas</th>
                </tr>
                </thead>
                <tbody>
                {playersTableRows} {/* Renderiza a variável que contém as linhas da tabela */}
                </tbody>
            </table>
        </>
    );
};

export default RoomDetails;