'use client';

import { useState, useRef } from 'react';
import { Room } from './types';
import RoomDetails from './components/RoomDetails';
import SockJS from 'sockjs-client';
import { Client } from "@stomp/stompjs";

export default function Home() {
  const [room, setRoom] = useState<Room | null>(null);
  const [roomToken, setRoomToken] = useState<string>('');
  const [newRoomName, setNewRoomName] = useState<string>(''); // Novo estado para criação
  const [playerNameInput, setPlayerNameInput] = useState<string>('');
  const [playerId, setPlayerId] = useState<string | null>(null);
  const stompClient = useRef<Client | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const connectWebSocket = (token: string, id: string) => {
    if (stompClient.current) {
      stompClient.current.deactivate();
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_URL}/ws-coup`),
      onConnect: () => {
        console.log("Conectado ao WebSocket");

        client.subscribe(`/topic/state-room/${token}/${id}`, (message) => {
          const updatedRoom = JSON.parse(message.body);
          setRoom(updatedRoom);
        });

        client.publish({
          destination: "/app/state-game",
          body: token
        });
      },
    });

    client.activate();
    stompClient.current = client;
  };

  const handleCreateRoom = async () => {
    if (!newRoomName) return alert("Digite um nome para a sala");

    try {
      const response = await fetch(`${API_URL}/create-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: newRoomName })
      });

      if (response.ok) {
        const data = await response.json();
        setRoomToken(data.token); // Redireciona logicamente preenchendo o token
        alert(`Sala criada! Use o token: ${data.token}`);
      }
    } catch (error) {
      console.error("Erro ao criar sala:", error);
    }
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
        setPlayerId(playerData.playerId);
        connectWebSocket(roomToken, playerData.playerId);
      } else {
        alert("Erro ao entrar na sala. Verifique se o token é válido.");
      }
    } catch (error) {
      console.error("Erro na conexão:", error);
    }
  };

  const handleStartGame = () => {
    if (stompClient.current && roomToken) {
      stompClient.current.publish({
        destination: `/app/${roomToken}/start`,
        body: "{}"
      });
    }
  };

  const handleLeaveRoom = () => {
    if (stompClient.current) {
      stompClient.current.deactivate();
      setRoom(null);
      setPlayerId(null);
      setRoomToken('');
    }
  };

  return (
      <main className="container mt-5">
        {!room ? (
            <div className="row">
              {/* SEÇÃO CRIAR SALA */}
              <div className="col-md-6">
                <div className="card p-4 shadow-sm">
                  <h3>Criar Nova Sala</h3>
                  <input
                      className="form-control mb-2"
                      placeholder="Nome da Sala (ex: Jogo do João)"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                  />
                  <button className="btn btn-success w-100" onClick={handleCreateRoom}>
                    Criar Sala
                  </button>
                </div>
              </div>

              {/* SEÇÃO ENTRAR EM SALA */}
              <div className="col-md-6">
                <div className="card p-4 shadow-sm">
                  <h3>Entrar em Sala Existente</h3>
                  <input
                      className="form-control mb-2"
                      placeholder="Token da Sala"
                      value={roomToken}
                      onChange={(e) => setRoomToken(e.target.value)}
                  />
                  <input
                      className="form-control mb-2"
                      placeholder="Seu Nome"
                      value={playerNameInput}
                      onChange={(e) => setPlayerNameInput(e.target.value)}
                  />
                  <button className="btn btn-primary w-100" onClick={handleJoinGame}>
                    Entrar no Jogo
                  </button>
                </div>
              </div>
            </div>
        ) : (
            <div className="card p-4 shadow-lg">
              <RoomDetails
                  room={room}
                  playerId={playerId}
                  playerNameInput={playerNameInput}
                  setPlayerNameInput={setPlayerNameInput}
                  handleJoinGame={handleJoinGame}
                  handleLeaveRoom={handleLeaveRoom}
                  handleStartGame={handleStartGame}
                  roomToken={roomToken}
              />
            </div>
        )}
      </main>
  );
}