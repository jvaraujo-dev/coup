'use client';

import { useState, useRef } from 'react';
import { Room } from './types';
import RoomDetails from './components/RoomDetails';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

export default function Home() {
  const [room, setRoom] = useState<Room | null>(null);
  const [roomToken, setRoomToken] = useState<string>('');
  const [playerNameInput, setPlayerNameInput] = useState<string>('');
  const [playerId, setPlayerId] = useState<string | null>(null);
  const stompClient = useRef<Stomp.Client | null>(null);

  // Busca URL das variáveis de ambiente
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const connectWebSocket = (token: string, id: string) => {
    // Encerra conexão anterior se existir
    if (stompClient.current) {
      stompClient.current.disconnect(() => {});
    }

    const socket = new SockJS(`${API_URL}/ws-coup`);
    const client = Stomp.over(socket);

    client.connect({}, () => {
      console.log("Conectado ao WebSocket");

      client.subscribe(`/topic/state-room/${token}/${id}`, (message: { body: string; }) => {
        const updatedRoom = JSON.parse(message.body);
        setRoom(updatedRoom);
      });

      client.send("/app/state-game", {}, token);
    });

    stompClient.current = client;
  };

  const handleJoinGame = async () => {
    if (!roomToken || !playerNameInput) return alert("Preencha o token e seu nome");

    try {
      const response = await fetch(`${API_URL}/api/rooms/${roomToken}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: playerNameInput })
      });

      if (response.ok) {
        const playerData = await response.json();
        const assignedId = playerData.playerId;

        setPlayerId(assignedId);
        connectWebSocket(roomToken, assignedId);
      } else {
        alert("Erro ao entrar na sala");
      }
    } catch (error) {
      console.error("Erro na conexão:", error);
    }
  };

  const handleStartGame = () => {
    if (stompClient.current && roomToken) {
      stompClient.current.send(`/app/${roomToken}/start`, {});
    }
  };

  const handleLeaveRoom = () => {
    if (stompClient.current) {
      stompClient.current.disconnect(() => {
        setRoom(null);
        setPlayerId(null);
      });
    }
  };

  return (
      <main className="container mt-5">
        {!room ? (
            <div className="card p-4">
              <h1>Entrar no Coup</h1>
              <input
                  className="form-control mb-2"
                  placeholder="Token da Sala"
                  value={roomToken}
                  onChange={(e) => setRoomToken(e.target.value)}
              />
              <button className="btn btn-primary" onClick={() => setRoom(null)}>Buscar Sala</button>
            </div>
        ) : (
            <RoomDetails
                room={room}
                playerId={playerId}
                playerNameInput={playerNameInput}
                setPlayerNameInput={setPlayerNameInput}
                handleJoinGame={handleJoinGame}
                handleLeaveRoom={handleLeaveRoom}
                handleStartGame={handleStartGame} roomToken={null}
            />
        )}
      </main>
  );
}