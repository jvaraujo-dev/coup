'use client';

import { useState, useEffect, useCallback, useRef } from 'react'; // Import useRef
import { Client } from '@stomp/stompjs';

// Define as interfaces
interface CardType {
  displayName: string;
}

interface PlayerState {
  playerId: string;
  playerName: string;
  cards: CardType[] | string[];
}

interface RoomState {
  token: string;
  roomName: string;
  players: PlayerState[];
}

export default function CoupGamePage() {
  const [roomNameInput, setRoomNameInput] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [roomToken, setRoomToken] = useState<string | null>(null);
  const [playerNameInput, setPlayerNameInput] = useState<string>('');
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const stompClientRef = useRef<Client | null>(null); // Ref para a instância do cliente STOMP

  const backendHttpUrl = process.env.NEXT_PUBLIC_BACKEND_HTTP_URL || 'http://localhost:8080';
  const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080/room-websocket';

  // Função auxiliar para analisar a string de jogadores recebida do backend
  const parsePlayersString = useCallback((playersString: string | null | undefined): PlayerState[] => {
    if (!playersString) return [];

    const playerStrings = playersString.substring(1, playersString.length - 1).split('), Player(');

    return playerStrings.map(playerStr => {
      const cleanedPlayerStr = playerStr.startsWith('Player(') ? playerStr.substring(7) : playerStr;

      // Usa regex para extrair playerId, playerName e a string de cards
      const match = cleanedPlayerStr.match(/playerId=(.*?),\s*playerName=(.*?),\s*cards=(.*)/);

      if (match) {
        const playerId = match[1];
        const playerName = match[2];
        const cardsRaw = match[3];

        // Analisa a string de cards: "[CARD1, CARD2]" -> ["CARD1", "CARD2"]
        const cards = cardsRaw
          .replace(/\[|\]/g, "")
          .split(', ')
          .slice(0, 2);

        return { playerId, playerName, cards } as PlayerState;
      }
      return null;
    }).filter((p): p is PlayerState => p !== null);
  }, []);

  // Gerencia a conexão WebSocket
  useEffect(() => {
    if (roomToken) {
      // Se já existe um cliente STOMP ativo (no ref), desativá-lo primeiro
      if (stompClientRef.current && stompClientRef.current.active) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null; // Limpa a referência antiga
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

        client.subscribe(`/topic/state-room/${roomToken}`, (room) => {
          try {
            const rawRoomState = JSON.parse(room.body);
            const parsedPlayers = parsePlayersString(rawRoomState.players);

            setRoomState({
              token: rawRoomState.token,
              roomName: rawRoomState.roomName,
              players: parsedPlayers,
            });
            console.log('Received and parsed room state:', {
              token: rawRoomState.token,
              roomName: rawRoomState.roomName,
              players: parsedPlayers,
            });

          } catch (e) {
            console.error('Failed to parse room state message:', room.body, e);
            setMessage('Erro ao processar o estado da sala. Dados brutos: ' + room.body);
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
        console.error('Additional details: ' + frame.body);
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
        if (stompClientRef.current && stompClientRef.current.active) { // Usa o ref para a limpeza
          stompClientRef.current.deactivate();
        }
      };
    } else {
      if (stompClientRef.current && stompClientRef.current.active) {
        stompClientRef.current.deactivate();
      }
      stompClientRef.current = null;
    }
  }, [roomToken, websocketUrl, parsePlayersString]); // stompClientInstance não é mais uma dependência

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomName: roomNameInput }),
      });

      if (response.ok) {
        const roomData = await response.json();
        setRoomToken(roomData.token);
        setMessage(`Sala "${roomData.roomName}" criada com sucesso! Token: ${roomData.token}`);
        setIsError(false);
        setRoomNameInput('');
      } else {
        const errorText = await response.text();
        setMessage(`Erro ao criar sala: ${response.status} - ${errorText || 'Erro desconhecido'}`);
        setIsError(true);
      }
    } catch (error) {
      console.error('Erro na requisição HTTP:', error);
      setMessage('Não foi possível conectar ao servidor backend. Verifique se ele está rodando.');
      setIsError(true);
    }
  };

  const handleJoinGame = () => {
    setMessage('');
    setIsError(false);

    if (!playerNameInput.trim()) {
      setMessage("Por favor, insira seu nome de jogador.");
      setIsError(true);
      return;
    }

    if (!roomToken) {
      setMessage("Você precisa estar em uma sala para entrar no jogo.");
      setIsError(true);
      return;
    }

    if (!stompClientRef.current || !stompClientRef.current.active) {
      setMessage("Conexão WebSocket não está ativa. Tente novamente ou verifique a sala.");
      setIsError(true);
      return;
    }

    stompClientRef.current.publish({
      destination: `/app/join-game/${roomToken}`,
      body: playerNameInput,
    });

    console.log(`Sent join-game request for player: ${playerNameInput} in room: ${roomToken}`);
  };

  const handleLeaveRoom = () => {
    if (stompClientRef.current && stompClientRef.current.active) {
      stompClientRef.current.deactivate();
    }
    setRoomToken(null);
    setRoomState(null);
    setPlayerNameInput('');
    setMessage('Você saiu da sala.');
    setIsError(false);
  };

  return (
    <div className="center-container">
      <div className="form-card">
        {!roomToken ? (
          <>
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
                {roomState?.players && roomState.players.length > 0 ? (
                  roomState.players.map((player: PlayerState) => (
                    <tr key={player.playerId}>
                      <td>{player.playerName}</td>
                      <td>
                        {Array.isArray(player.cards) && player.cards.length > 0
                          ? player.cards.join(', ')
                          : 'Sem cartas'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2}>Nenhum jogador nesta sala ainda.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}

        {message && (
          <div style={{ marginTop: '20px', color: isError ? 'red' : 'green' }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
