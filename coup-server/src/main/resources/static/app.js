// A instância do STOMP Client
const stompClient = new StompJs.Client({
    brokerURL: 'ws://localhost:8080/room-websocket', // Ajuste para seu ambiente Docker se necessário
    reconnectDelay: 5000, // Tentar reconectar a cada 5 segundos
    debug: function(str) {
        console.log('STOMP Debug:', str);
    }
});

let currentSubscription = null;
let currentRoomToken = null; // Armazena o token da sala que o usuário está atualmente

// --- Funções de Controle de UI ---

function showTokenInputSection() {
    $("#token-input-section").show();
    $("#room-section").hide();
    $("#room-messages").empty(); // Limpa mensagens anteriores
    $("#currentRoomToken").text(""); // Limpa o token exibido
    $("#playerName").val(""); // Limpa o campo de nome do jogador
}

function showRoomSection(token) {
    $("#token-input-section").hide();
    $("#room-section").show();
    $("#currentRoomToken").text(token); // Exibe o token da sala atual
    // Inicialmente, mostra o campo de nome do jogador
    $("#player-name-input").show();
}

function hidePlayerNameInput() {
    $("#player-name-input").hide();
}

// --- Funções de Conexão STOMP ---

stompClient.onConnect = (frame) => {
    console.log('Connected: ' + frame);
};

stompClient.onWebSocketError = (error) => {
    console.error('Error with websocket', error);
};

stompClient.onStompError = (frame) => {
    console.error('Broker reported error: ' + frame.headers['message']);
    console.error('Additional details: ' + frame.body);
};

stompClient.onDisconnect = (frame) => {
    console.log('Disconnected: ' + frame);
    currentRoomToken = null;
    showTokenInputSection();
};

// --- Funções de Ação do Usuário ---

function subscribeRoom() {
    const token = $("#token").val().trim();

    if (!token) {
        alert("Por favor, insira um token da sala.");
        return;
    }

    if (!stompClient.active) {
        stompClient.activate();
    }

    if (currentSubscription) {
        currentSubscription.unsubscribe();
        console.log("Unsubscribed from previous room.");
    }

    currentRoomToken = token;

    const destinationTopic = `/topic/state-room/${token}`;
    currentSubscription = stompClient.subscribe(destinationTopic, (room) => {
        showRoomState(room.body);
    });
    console.log(`Subscribed to dynamic room: ${destinationTopic}`);

    stompClient.publish({
        destination: "/app/state-game",
        body: token
    });

    showRoomSection(token); // Exibe a seção da sala, incluindo o campo de nome
}

// NOVO: Função para o jogador entrar no jogo com seu nome
function joinGame() {
    const playerName = $("#playerName").val().trim();

    if (!playerName) {
        alert("Por favor, insira seu nome de jogador.");
        return;
    }

    if (!currentRoomToken) {
        alert("Você precisa estar em uma sala para entrar no jogo.");
        return;
    }

    if (!stompClient.active) {
        alert("Conexão WebSocket não ativa. Tente reconectar.");
        return;
    }

    // Publica uma mensagem para o backend para criar o jogador e adicioná-lo à sala
    stompClient.publish({
        destination: `/app/join-game/${currentRoomToken}`, // Novo destino no backend
        body: playerName // Envia o nome do jogador
    });

    console.log(`Sent join-game request for player: ${playerName} in room: ${currentRoomToken}`);

    // Esconde o campo de nome após o envio, pois o jogador já "entrou"
    hidePlayerNameInput();
}


function leaveRoom() {
    if (currentSubscription) {
        currentSubscription.unsubscribe();
        currentSubscription = null;
        console.log("Unsubscribed from current room.");
    }
    currentRoomToken = null;
    showTokenInputSection();
    console.log("Left the room.");
}

//function showRoomState(message) {
//    try {
//        const roomState = JSON.parse(message);
//        $("#room-messages").empty();
//        const playerInfo = roomState.players.map(p => `${p.playerName} (${p.cards.join(", ")})`).join("; ");
//        $("#room-messages").append(`<tr><td>Room: ${roomState.roomName} | Players: ${playerInfo}</td></tr>`);
//    } catch (e) {
//        console.error("Failed to parse room state message:", message, e);
//        $("#room-messages").append(`<tr><td>Raw Message: ${message}</td></tr>`);
//    }
//}

function showRoomState(message) {
    try {
        const roomState = JSON.parse(message); // roomState will contain token, roomName, and players

        $("#room-messages").empty(); // Clear previous content to display the full, current state

        let roomDetailsHtml = `
            <tr>
                <td colspan="2">
                    <h4>Room Name: ${roomState.roomName}</h4>
                    <p>Token: ${roomState.token}</p>
                </td>
            </tr>
            <tr>
                <td colspan="2"><strong>Players in Room:</strong></td>
            </tr>
        `;

        if (roomState.players && roomState.players.length > 0) {
            roomState.players.forEach(player => {
                // Ensure player.cards exists and is an array, then join cards
                const playerCards = player.cards && Array.isArray(player.cards) && player.cards.length > 0
                                    ? player.cards.map(card => card.displayName || card).join(", ")
                                    : "No cards"; // Fallback for no cards or unexpected format

                roomDetailsHtml += `
                    <tr>
                        <td>- <strong>${player.playerName}</strong></td>
                        <td>(${playerCards})</td>
                    </tr>
                `;
            });
        } else {
            roomDetailsHtml += `
                <tr>
                    <td colspan="2">No players in this room yet.</td>
                </tr>
            `;
        }

        $("#room-messages").append(roomDetailsHtml);

    } catch (e) {
        console.error("Failed to parse room state message:", message, e);
        $("#room-messages").append(`<tr><td colspan="2">Raw Message: ${message}</td></tr>`);
    }
}

// --- Inicialização ---
$(function () {
    $("form").on('submit', (e) => e.preventDefault());

    $("#subscribeRoom").click(() => subscribeRoom());
    $("#leaveRoom").click(() => leaveRoom());
    $("#joinGame").click(() => joinGame()); // NOVO: Event listener para o botão "Join Game"

    $(document).ready(function() {
        showTokenInputSection(); // Garante que a seção de entrada de token seja mostrada no início
        stompClient.activate(); // Inicia a conexão do StompClient automaticamente
    });
});