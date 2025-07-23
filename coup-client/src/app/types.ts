export interface CardType {
    displayName: string;
}

export interface PlayerState {
    playerId: string;
    playerName: string;
    cards: CardType[] | string[];
}

export interface RoomState {
    token: string;
    roomName: string;
    players: PlayerState[];
}

export interface RoomDetailsProps {
    roomState: RoomState | null;
    roomToken: string | null;
    playerNameInput: string;
    setPlayerNameInput: (name: string) => void;
    handleJoinGame: () => void;
    handleLeaveRoom: () => void;
}