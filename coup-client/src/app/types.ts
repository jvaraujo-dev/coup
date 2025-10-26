export interface CardType {
    displayName: string;
}

export interface PlayerState {
    playerId: string;
    playerName: string;
    cards: CardType[] | string[];
}

export interface Room {
    token: string;
    roomName: string;
    roomState: string;
    players: PlayerState[];
}

export interface RoomDetailsProps {
    room: Room | null;
    roomToken: string | null;
    playerNameInput: string;
    setPlayerNameInput: (name: string) => void;
    handleJoinGame: () => void;
    handleLeaveRoom: () => void;
}