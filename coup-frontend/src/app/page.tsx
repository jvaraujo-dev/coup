'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import RoomDetails from './components/RoomDetails';
import Notification from './components/Notification';
import { PlayerState, Room } from './types';

export default function CoupGamePage() {
  const [roomNameInput, setRoomNameInput] = useState<string>('');
  const [roomTokenInput, setRoomTokenInput] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [roomToken, setRoomToken] = useState<string | null>(null);
  const [playerNameInput, setPlayerNameInput] = useState<string>('');
  const [room, setRoom] = useState<Room | null>(null);
  const stompClientRef = useRef<Client | null>(null);

  const backendHttpUrl = process.env.NEXT_PUBLIC_BACKEND_HTTP_URL || 'http://localhost:8080';
  const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080/room-websocket';

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const parsePlayersString = useCallback((playersString: string | null | undefined): PlayerState[] => {
    if (!playersString) return [];

    const playerStrings = playersString.substring(1, playersString.length - 1).split('), Player(');

    return playerStrings.map(playerStr => {
      const cleanedPlayerStr = playerStr.startsWith('Player(') ? playerStr.substring(7) : playerStr;
      const match = cleanedPlayerStr.match(/playerId=(.*?),\s*playerName=(.*?),\s*cards=(.*)/);

      if (match) {
        const playerId = match[1];
        const playerName = match[2];
        const cardsRaw = match[3];
        const cards = cardsRaw
            .replace(/\[|\]/g, "")
            .split(', ')
            .filter(s => s.trim() !== '');

        return { playerId, playerName, cards } as PlayerState;
      }
      return null;
    }).filter((p): p is PlayerState => p !== null);
  }, []);

  useEffect(() => {
    if (roomToken) {
      if (stompClientRef.current && stompClientRef.current.active) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }

      const client = new Client({
        brokerURL: websocketUrl,
        reconnectDelay: 5000,
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
      });

      client.onConnect = (frame) => {
        console.log('Connected: ' + frame);
        setMessage('Conectado ao WebSocket da sala!');
        setIsError(false);

        client.subscribe(`/topic/state-room/${roomToken}`, (message) => {
          try {
            const payload = JSON.parse(message.body);

            if (payload.message || payload.error) {
              setMessage(`Erro do servidor: ${payload.message || payload.error}`);
              setIsError(true);
              return;
            }

            if (!payload.players) {
              console.warn("Payload recebido sem lista de jogadores:", payload);
              return;
            }

            const parsedPlayers = parsePlayersString(payload.players);

            setRoom({
              token: payload.token,
              roomName: payload.roomName,
              stateRoom: payload.stateRoom,
              players: parsedPlayers,
            });

          } catch (e) {
            console.error('Falha ao processar mensagem:', message.body, e);
            setMessage('Erro ao processar resposta do servidor.');
            setIsError(true);
          }
        });

        client.publish({
          destination: "/app/state-game",
          body: roomToken
        });
      };

      client.onWebSocketError = (error) => {
        console.error('Error with websocket', error);
        setMessage('Erro na conexão WebSocket.');
        setIsError(true);
      };

      client.onStompError = (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        setMessage('Erro no protocolo STOMP.');
        setIsError(true);
      };

      client.onDisconnect = (frame) => {
        console.log('Disconnected: ' + frame);
        setMessage('Desconectado do WebSocket da sala.');
        setIsError(false);
      };

      client.activate();
      stompClientRef.current = client;

      return () => {
        if (stompClientRef.current && stompClientRef.current.active) {
          stompClientRef.current.deactivate();
        }
      };
    } else {
      if (stompClientRef.current && stompClientRef.current.active) {
        stompClientRef.current.deactivate();
      }
      stompClientRef.current = null;
    }
  }, [roomToken, websocketUrl, parsePlayersString]);

  const handleCreateRoom = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setIsError(false);

    if (!roomNameInput.trim()) {
      setMessage('Por favor, insira um nome para a sala.');
      setIsError(true);
      return;
    }

    try {
      const response = await fetch(`${backendHttpUrl}/create-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: roomNameInput }),
      });

      if (response.ok) {
        const roomData = await response.json();
        setRoomToken(roomData.token);
        setMessage(`Sala "${roomData.roomName}" criada!`);
        setIsError(false);
        setRoomNameInput('');
      } else {
        const errorText = await response.text();
        setMessage(`Erro ao criar sala: ${response.status} - ${errorText || 'Erro desconhecido'}`);
        setIsError(true);
      }
    } catch (error) {
      console.error('Erro na requisição HTTP:', error);
      setMessage('Não foi possível conectar ao servidor backend.');
      setIsError(true);
    }
  };

  const handleJoinGame = () => {
    setMessage('');
    setIsError(false);

    const currentToken = roomToken || roomTokenInput;

    if (!playerNameInput.trim()) {
      setMessage("Por favor, insira seu nome de jogador.");
      setIsError(true);
      return;
    }

    if (!currentToken) {
      setMessage("Você precisa estar em uma sala para entrar no jogo.");
      setIsError(true);
      return;
    }

    if (!roomToken && roomTokenInput.trim()) {
      setRoomToken(roomTokenInput.trim());
    }

    if (!stompClientRef.current || !stompClientRef.current.active) {
      setMessage("Conexão WebSocket não está ativa. Tente novamente.");
      setIsError(true);
      return;
    }

    stompClientRef.current.publish({
      destination: `/app/${currentToken}/join-game`,
      body: playerNameInput,
    });
  };

  const handleStartGame = () => {
    if (!stompClientRef.current || !stompClientRef.current.active) {
      setMessage("Conexão WebSocket não está ativa.");
      setIsError(true);
      return;
    }
    stompClientRef.current.publish({
      destination: `/app/${roomToken}/start`
    });
  }

  const handleLeaveRoom = () => {
    if (stompClientRef.current && stompClientRef.current.active) {
      stompClientRef.current.deactivate();
    }
    setRoomToken(null);
    setRoom(null);
    setPlayerNameInput('');
    setMessage('Você saiu da sala.');
    setIsError(false);
  };

  const handleEnterExistingRoom = (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setIsError(false);

    if (!roomTokenInput.trim()) {
      setMessage('Por favor, insira o token da sala.');
      setIsError(true);
      return;
    }
    setRoomToken(roomTokenInput.trim());
  };

  return (
      <div className="center-container">

        <Notification
            message={message}
            isError={isError}
            onClose={() => setMessage('')}
        />

        <div className="form-card">
          {!roomToken ? (
              <>
                <h2>Entrar em Sala Existente</h2>
                <form onSubmit={handleEnterExistingRoom}>
                  <div className="form-group">
                    <label htmlFor="tokenRoom">Token da Sala:</label>
                    <input
                        type="text"
                        id="tokenRoom"
                        className="form-control"
                        placeholder="Digite o Token da sala"
                        value={roomTokenInput}
                        onChange={(e) => setRoomTokenInput(e.target.value)}
                        required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Entrar
                  </button>
                </form>

                <hr />

                <h2>Criar Nova Sala</h2>
                <form onSubmit={handleCreateRoom}>
                  <div className="form-group">
                    <label htmlFor="roomName">Nome da Sala:</label>
                    <input
                        type="text"
                        id="roomName"
                        className="form-control"
                        placeholder="Digite o nome da sala"
                        value={roomNameInput}
                        onChange={(e) => setRoomNameInput(e.target.value)}
                        required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Criar Sala
                  </button>
                </form>
              </>
          ) : (
              <RoomDetails
                  room={room}
                  roomToken={roomToken}
                  playerNameInput={playerNameInput}
                  setPlayerNameInput={setPlayerNameInput}
                  handleJoinGame={handleJoinGame}
                  handleLeaveRoom={handleLeaveRoom}
                  handleStartGame={handleStartGame}
              />
          )}
        </div>
      </div>
  );
}