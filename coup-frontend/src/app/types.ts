export interface CardType {
    displayName: string;
}

export interface PlayerState {
    playerId: string;
    playerName: string;
    cards: string[];
}

export interface Room {
    token: string;
    roomName: string;
    stateRoom: string;
    ownerId: string;
    players: PlayerState[];
}

export interface RoomDetailsProps {
    room: Room | null;
    roomToken: string | null;
    playerNameInput: string;
    playerId: string | null;
    setPlayerNameInput: (name: string) => void;
    handleJoinGame: () => void;
    handleLeaveRoom: () => void;
    handleStartGame: () => void;
}