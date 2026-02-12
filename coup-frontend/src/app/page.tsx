'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import RoomDetails from './components/RoomDetails';
import Notification from './components/Notification';
import SockJS from 'sockjs-client';
import { Room } from './types';

export default function CoupGamePage() {
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'join' | 'create'>('join');

  const [roomNameInput, setRoomNameInput] = useState<string>('');
  const [roomTokenInput, setRoomTokenInput] = useState<string>('');
  const [playerNameInput, setPlayerNameInput] = useState<string>('');

  const [roomToken, setRoomToken] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);

  const stompClientRef = useRef<Client | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_HTTP_URL || 'http://localhost:8080';

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const connectWebSocket = useCallback((token: string, myId: string) => {
    if (stompClientRef.current?.active) return;

    console.log("Iniciando conexão WebSocket...");
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_URL}/room-websocket`),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('WebSocket Conectado!');
        setMessage('Conectado ao jogo!');
        setIsError(false);

        client.subscribe(`/topic/state-room/${token}/${myId}`, (msg) => {
          try {
            const updatedRoom = JSON.parse(msg.body);
            setRoom(updatedRoom);
          } catch (e) {
            console.error("Erro ao processar estado da sala", e);
          }
        });

        client.publish({ destination: "/app/state-game", body: token });
      },
      onStompError: (frame) => {
        console.error('Erro STOMP:', frame.headers['message']);
        setMessage('Erro na conexão em tempo real.');
        setIsError(true);
      },
      onWebSocketClose: () => {
        console.log("Conexão fechada.");
      }
    });

    client.activate();
    stompClientRef.current = client;
  }, [API_URL]);

  useEffect(() => {
    return () => {
      if (stompClientRef.current) stompClientRef.current.deactivate();
    };
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNameInput.trim()) return setMessage('Digite um nome para a sala.');

    try {
      const res = await fetch(`${API_URL}/create-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: roomNameInput }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.ownerId) {
          localStorage.setItem('user_session', data.ownerId);
        }
        setRoomTokenInput(data.token);
        setMessage(`Sala criada! Token: ${data.token}`);
        setIsError(false);
        setActiveTab('join'); // Muda para a aba de entrar
      } else {
        throw new Error('Falha ao criar sala');
      }
    } catch (error) {
      console.error(error)
      setMessage('Erro ao criar sala. O servidor está rodando?');
      setIsError(true);
    }
  };

  const handleJoinGame = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const tokenToUse = roomToken || roomTokenInput;

    if (!tokenToUse || !playerNameInput.trim()) {
      setMessage("Preencha o Token da sala e seu Nome.");
      setIsError(true);
      return;
    }

    if (roomToken === tokenToUse && playerId && stompClientRef.current?.active) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/rooms/${tokenToUse}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: playerNameInput }),
      });

      const data = await res.json();

      if (data.error == null) {
        console.log(data)
        const newPlayerId = data.playerId;

        setRoomToken(tokenToUse);
        setPlayerId(newPlayerId);

        connectWebSocket(tokenToUse, newPlayerId);
      } else {
        console.log(data)
        setMessage(`${data.error}`);
        setIsError(true);
      }
    } catch (error) {
      console.error(error);
      setMessage('Erro de conexão com o servidor.');
      setIsError(true);
    }
  };

  const handleStartGame = () => {
    if (stompClientRef.current && roomToken) {
      const mySessionId = localStorage.getItem('user_session');

      stompClientRef.current.publish({
        destination: `/app/${roomToken}/start`,
        body: JSON.stringify({ sessionId: mySessionId })
      });
    }
  };

  const handleLeaveRoom = () => {
    if (stompClientRef.current) stompClientRef.current.deactivate();
    setRoomToken(null);
    setRoom(null);
    setPlayerId(null);
    setMessage('Você saiu da sala.');
  };

  return (
      <div className="center-container">
        <Notification
            message={message}
            isError={isError}
            onClose={() => setMessage('')}
        />

        {!roomToken ? (
            <div className="form-card">
              <div className="tabs mb-4">
                <button
                    className={`btn ${activeTab === 'join' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
                    onClick={() => setActiveTab('join')}
                >
                  Entrar em Sala
                </button>
                <button
                    className={`btn ${activeTab === 'create' ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => setActiveTab('create')}
                >
                  Criar Nova
                </button>
              </div>

              {activeTab === 'join' ? (
                  <form onSubmit={handleJoinGame}>
                    <div className="form-group mb-3">
                      <label>Token da Sala:</label>
                      <input
                          className="form-control"
                          placeholder="Ex: abc-123"
                          value={roomTokenInput}
                          onChange={(e) => setRoomTokenInput(e.target.value)}
                      />
                    </div>
                    <div className="form-group mb-3">
                      <label>Seu Nome:</label>
                      <input
                          className="form-control"
                          placeholder="Seu Apelido"
                          value={playerNameInput}
                          onChange={(e) => setPlayerNameInput(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                      Entrar no Jogo
                    </button>
                  </form>
              ) : (
                  <form onSubmit={handleCreateRoom}>
                    <div className="form-group mb-3">
                      <label>Nome da Sala:</label>
                      <input
                          className="form-control"
                          placeholder="Ex: Jogo da Galera"
                          value={roomNameInput}
                          onChange={(e) => setRoomNameInput(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn btn-success w-100">
                      Criar Sala
                    </button>
                  </form>
              )}
            </div>
        ) : (
            <div className="game-container" style={{ width: '100%', maxWidth: '800px' }}>
              <div className="card p-4 shadow-lg">
                <RoomDetails
                    room={room}
                    roomToken={roomToken}
                    playerNameInput={playerNameInput}
                    setPlayerNameInput={setPlayerNameInput}
                    handleJoinGame={() => {}}
                    handleLeaveRoom={handleLeaveRoom}
                    handleStartGame={handleStartGame}
                    playerId={playerId}
                />
              </div>
            </div>
        )}
      </div>
  );
}