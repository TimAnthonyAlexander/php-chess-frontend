// User related types
export interface User {
    id: number;
    name: string;
    email: string;
}

export interface AuthResponse {
    token: string;
    user: User;
    message: string;
}

// Time control related types
export interface TimeControl {
    id: number;
    name: string;
    slug: string;
    time_class: string;
    initial_sec: number;
    increment_ms: number;
}

// Game related types
export interface Game {
    id: number;
    white_id: number;
    black_id: number;
    time_control_id: number;
    status: 'active' | 'finished';
    result: '1-0' | '0-1' | '1/2-1/2' | null;
    reason: 'checkmate' | 'resign' | 'timeout' | 'draw' | null;
    fen: string;
    move_index: number;
    white_time_ms: number;
    black_time_ms: number;
    last_move_at: string | null;
    lock_version: number;
    created_at: string;
    updated_at: string;
    to_move?: 'white' | 'black';
    to_move_user_id?: number;
    // Relationships
    timeControl?: TimeControl;
    white?: User;
    black?: User;
}

export interface GameMove {
    id: number;
    game_id: number;
    ply: number;
    by_user_id: number;
    uci: string;
    san: string;
    from_sq: string;
    to_sq: string;
    promotion: string | null;
    fen_after: string;
    white_time_ms_after: number;
    black_time_ms_after: number;
    created_at: string;
}

export interface GameSync {
    status: string;
    result: string | null;
    reason: string | null;
    lock_version: number;
    white_time_ms: number;
    black_time_ms: number;
    last_move_at: string | null;
    moves: GameMove[];
    to_move: 'white' | 'black';
    to_move_user_id: number;
    since?: number;
    white?: User;
    black?: User;
    timeControl?: TimeControl;
}

// Rating related types
export interface PlayerRating {
    id: number;
    user_id: number;
    time_class: string;
    rating: number;
    games: number;
    user?: User;
}

// Queue related types
export interface QueueStatus {
    status: 'queued' | 'matched';
    widening?: {
        delta: number;
    };
    game_id?: number;
}

// API error response
export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}
