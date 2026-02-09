'use client';

import React from 'react';
import { PlayerState, RoomDetailsProps } from '../types'

const RoomDetails: React.FC<RoomDetailsProps> = ({
                                                     room,
                                                     playerNameInput,
                                                     setPlayerNameInput,
                                                     handleJoinGame,
                                                     handleLeaveRoom,
                                                     handleStartGame,
                                                     playerId
                                                 }) => {

    let playersTableRows;

    if (room?.players && room.players.length > 0) {
        playersTableRows = room.players.map((player: PlayerState) => {
            const cardsDisplay = player.cards && player.cards.length > 0
                ? player.cards.join(", ")
                : '🃏 Carta Oculta';

            return (
                <tr key={player.playerId} style={player.playerId === playerId ? { fontWeight: 'bold', color: '#4facfe' } : {}}>
                    <td>
                        {player.playerName} {player.playerId === playerId ? "(Você)" : ""}
                    </td>
                    <td>{cardsDisplay}</td>
                </tr>
            );
        });
    } else {
        playersTableRows = (
            <tr>
                <td colSpan={2}>Nenhum jogador nesta sala ainda.</td>
            </tr>
        );
    }

    return (
        <>
            <h2>Sala Atual: <span id="currentRoomToken">{room?.roomName || 'Carregando...'}</span></h2>
            <p>Token da Sala: <strong>{room?.token}</strong></p>
            <p>Estado da Sala: <strong>{room?.stateRoom}</strong></p>

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
                <button onClick={handleJoinGame} className="btn btn-info" style={{ marginLeft: '10px' }}>
                    Entrar no Jogo
                </button>

                <button onClick={handleStartGame} className="btn btn-success" style={{ marginLeft: '10px' }}>
                    Iniciar Jogo
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
                {playersTableRows}
                </tbody>
            </table>
        </>
    );
};

export default RoomDetails;