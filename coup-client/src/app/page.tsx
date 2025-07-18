'use client'; // Indica que este é um Client Component (necessário para hooks, eventos, etc.)

import { useState } from 'react';

export default function CreateRoomPage() {
  const [roomName, setRoomName] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);

  const handleCreateRoom = async (event: React.FormEvent) => {
    event.preventDefault(); // Previne o recarregamento da página

    setMessage(''); // Limpa mensagens anteriores
    setIsError(false);

    if (!roomName.trim()) {
      setMessage('Por favor, insira um nome para a sala.');
      setIsError(true);
      return;
    }

    try {
      // URL do seu backend. Certifique-se de que 'localhost' é acessível ou use a variável de ambiente se estiver no Docker.
      // Se estiver rodando o frontend via 'npm run dev' e o backend via 'make up', 'localhost:8080' deve funcionar.
      // Se ambos estiverem no Docker Compose, o backend estaria em 'http://coup-backend:8080'.
      // Para este cenário de "recomeçar", assumimos que você está testando localmente.

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
      //const backendUrl = 'http://localhost:8080';

      const response = await fetch(`${backendUrl}/create-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomName: roomName }),
      });

      if (response.ok) {
        const roomData = await response.json(); // Se o backend retornar dados da sala
        setMessage(`Sala "${roomData.roomName}" criada com sucesso! Token: ${roomData.token}`);
        setIsError(false);
        setRoomName(''); // Limpa o campo após o sucesso
        // Opcional: redirecionar para a página da sala usando Next.js Router
        // import { useRouter } from 'next/navigation';
        // const router = useRouter();
        // router.push(`/room/${roomData.token}`);
      } else {
        const errorText = await response.text();
        setMessage(`Erro ao criar sala: ${response.status} - ${errorText || 'Erro desconhecido'}`);
        setIsError(true);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setMessage('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      setIsError(true);
    }
  };

  return (
    <div className="center-container">
      <div className="form-card">
        <h2>Criar Nova Sala</h2>
        <form onSubmit={handleCreateRoom}>
          <div className="form-group">
            <label htmlFor="roomName">Nome da Sala:</label>
            <input
              type="text"
              id="roomName"
              className="form-control"
              placeholder="Digite o nome da sala"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Criar Sala
          </button>
        </form>
        {message && (
          <div style={{ marginTop: '20px', color: isError ? 'red' : 'green' }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}