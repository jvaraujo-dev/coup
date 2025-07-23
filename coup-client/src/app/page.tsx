'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import RoomDetails from './components/RoomDetails';
import { PlayerState, RoomState } from './types'// Importe o novo componente RoomDetails


export default function CoupGamePage() {
  const [roomNameInput, setRoomNameInput] = useState<string>(''); // Estado para o nome da sala ao criar
  const [roomTokenInput, setRoomTokenInput] = useState<string>(''); // Estado para o token ao entrar em sala existente
  const [message, setMessage] = useState<string>(''); // Mensagens de feedback para o usuário
  const [isError, setIsError] = useState<boolean>(false); // Indica se a mensagem é um erro
  const [roomToken, setRoomToken] = useState<string | null>(null); // Token da sala ativa, controla a renderização
  const [playerNameInput, setPlayerNameInput] = useState<string>(''); // Nome do jogador
  const [roomState, setRoomState] = useState<RoomState | null>(null); // Estado da sala recebido via WebSocket
  const stompClientRef = useRef<Client | null>(null); // Referência para a instância do cliente STOMP

  const backendHttpUrl = process.env.NEXT_PUBLIC_BACKEND_HTTP_URL || 'http://localhost:8080';
  const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080/room-websocket';

  // Função auxiliar para analisar a string de jogadores recebida do backend
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
            .filter(s => s.trim() !== ''); // Garante que não haja entradas vazias se houver vírgulas extra

        return { playerId, playerName, cards } as PlayerState;
      }
      return null;
    }).filter((p): p is PlayerState => p !== null); // Filtra nulos e garante a tipagem
  }, []);

  // Efeito para gerenciar a conexão WebSocket. Ativa ou desativa o cliente STOMP
  // quando o roomToken ou parsePlayersString muda.
  useEffect(() => {
    if (roomToken) {
      // Se já existe um cliente STOMP ativo, desativá-lo primeiro
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

        // Se inscreve ao tópico da sala para receber atualizações de estado
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

        // Solicita o estado inicial da sala ao backend
        client.publish({
          destination: "/app/state-game",
          body: roomToken
        });
      };

      // Handlers para erros e desconexão do WebSocket
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

      client.activate(); // Ativa o cliente STOMP
      stompClientRef.current = client; // Armazena a instância no ref

      // Função de limpeza: desativa o cliente STOMP quando o componente desmonta ou roomToken muda
      return () => {
        if (stompClientRef.current && stompClientRef.current.active) {
          stompClientRef.current.deactivate();
        }
      };
    } else {
      // Se não há roomToken, garante que o cliente STOMP seja desativado
      if (stompClientRef.current && stompClientRef.current.active) {
        stompClientRef.current.deactivate();
      }
      stompClientRef.current = null;
    }
  }, [roomToken, websocketUrl, parsePlayersString]); // Dependências do useEffect

  // Handler para criar uma nova sala via HTTP POST
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
        setRoomToken(roomData.token); // Define o token da sala para ativar o useEffect do WebSocket
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

  // Handler para um jogador entrar no jogo (publicar nome para o backend via WebSocket)
  const handleJoinGame = () => {
    setMessage('');
    setIsError(false);

    // Usa o token da sala atualmente ativa (roomToken) ou, se não houver, o do input (roomTokenInput)
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

    // Se o roomToken ainda não estiver definido (vindo do input de entrar sala), defina-o
    // Isso garante que o useEffect seja ativado para conectar ao WebSocket antes de publicar.
    if (!roomToken && roomTokenInput.trim()) {
      setRoomToken(roomTokenInput.trim());
    }

    // Verifica se o cliente STOMP está ativo antes de publicar
    if (!stompClientRef.current || !stompClientRef.current.active) {
      setMessage("Conexão WebSocket não está ativa. Tente novamente ou verifique a sala.");
      setIsError(true);
      return;
    }

    // Publica a mensagem para o backend com o nome do jogador
    stompClientRef.current.publish({
      destination: `/app/join-game/${currentToken}`,
      body: playerNameInput,
    });

    console.log(`Sent join-game request for player: ${playerNameInput} in room: ${currentToken}`);
  };

  // Handler para sair da sala e desconectar do WebSocket
  const handleLeaveRoom = () => {
    if (stompClientRef.current && stompClientRef.current.active) {
      stompClientRef.current.deactivate();
    }
    setRoomToken(null); // Volta para a tela de criação/entrada de sala
    setRoomState(null); // Limpa o estado da sala
    setPlayerNameInput(''); // Limpa o nome do jogador
    setMessage('Você saiu da sala.');
    setIsError(false);
  };

  // Handler para entrar em uma sala existente usando o token
  const handleEnterExistingRoom = (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setIsError(false);

    if (!roomTokenInput.trim()) {
      setMessage('Por favor, insira o token da sala.');
      setIsError(true);
      return;
    }
    // Define o token da sala para ativar o useEffect e a conexão WebSocket
    setRoomToken(roomTokenInput.trim());
  };


  return (
      <div className="center-container">
        <div className="form-card">
          {!roomToken ? (
              // Se não há token da sala, mostra os formulários de entrada e criação de sala
              <>
                <h2>Entrar em Sala Existente</h2>
                <form onSubmit={handleEnterExistingRoom}> {/* Novo formulário para entrar em sala existente */}
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

                <hr /> {/* Separador entre os formulários */}

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
              // Se há token da sala, renderiza o componente RoomDetails para mostrar os detalhes da sala
              <RoomDetails
                  roomState={roomState}
                  roomToken={roomToken}
                  playerNameInput={playerNameInput}
                  setPlayerNameInput={setPlayerNameInput}
                  handleJoinGame={handleJoinGame}
                  handleLeaveRoom={handleLeaveRoom}
              />
          )}

          {/* Exibe mensagens de feedback para o usuário */}
          {message && (
              <div style={{ marginTop: '20px', color: isError ? 'red' : 'green' }}>
                {message}
              </div>
          )}
        </div>
      </div>
  );
}