import axios from 'axios';
import type {
    AuthResponse,
    Game,
    GameMove,
    GameSync,
    PlayerRating,
    QueueStatus,
    TimeControl,
} from '../types';

// Create axios instance with base URL and default headers
const api = axios.create({
    baseURL: 'http://localhost:4999/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add request interceptor to include auth token in requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('chess_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth Services
export const authService = {
    register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/register', { name, email, password });
        return response.data;
    },

    login: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/login', { email, password });
        localStorage.setItem('chess_token', response.data.token);
        return response.data;
    },

    logout: (): void => {
        localStorage.removeItem('chess_token');
    },

    isAuthenticated: (): boolean => {
        return localStorage.getItem('chess_token') !== null;
    }
};

// Game Mode Services
export const modeService = {
    getTimeControls: async (): Promise<TimeControl[]> => {
        const response = await api.get<TimeControl[]>('/modes');
        return response.data;
    }
};

// Matchmaking Services
export const queueService = {
    joinQueue: async (timeControlSlug: string): Promise<QueueStatus> => {
        const response = await api.post<QueueStatus>(`/queue/join/${timeControlSlug}`);
        return response.data;
    },

    leaveQueue: async (timeControlSlug: string): Promise<void> => {
        await api.delete(`/queue/leave/${timeControlSlug}`);
    }
};

// Game Services
export const gameService = {
    getGame: async (gameId: number): Promise<{ game: Game, moves: GameMove[] }> => {
        const response = await api.get(`/games/${gameId}`);
        return response.data;
    },

    syncGame: async (gameId: number, sincePly: number): Promise<GameSync> => {
        const response = await api.get(`/games/${gameId}/sync?since=${sincePly}`);
        return response.data;
    },

    makeMove: async (gameId: number, uci: string, lockVersion: number): Promise<{ ok: boolean, lock_version: number } | { finished: boolean, result: string, reason: string }> => {
        const response = await api.post(`/games/${gameId}/move`, { uci, lock_version: lockVersion });
        return response.data;
    },

    resignGame: async (gameId: number): Promise<{ finished: boolean, result: string, reason: string }> => {
        const response = await api.post(`/games/${gameId}/resign`);
        return response.data;
    },

    offerDraw: async (gameId: number): Promise<{ status: string }> => {
        const response = await api.post(`/games/${gameId}/draw`);
        return response.data;
    },

    acceptDraw: async (gameId: number): Promise<{ finished: boolean, result: string, reason: string }> => {
        const response = await api.post(`/games/${gameId}/acceptDraw`);
        return response.data;
    }
};

// User Services
export const userService = {
    getActiveGame: async (): Promise<{ game_id: number | null }> => {
        const response = await api.get('/me/active-game');
        return response.data;
    },

    getRecentGames: async (timeClass?: string): Promise<Game[]> => {
        let url = '/me/recent-games';
        if (timeClass) {
            url += `?time_class=${timeClass}`;
        }
        const response = await api.get<Game[]>(url);
        return response.data;
    },

    getRatings: async (): Promise<PlayerRating[]> => {
        const response = await api.get<PlayerRating[]>('/me/ratings');
        return response.data;
    }
};

// Leaderboard Services
export const leaderboardService = {
    getLeaderboard: async (timeClass: string, limit: number = 100): Promise<PlayerRating[]> => {
        const response = await api.get<PlayerRating[]>(`/leaderboard?time_class=${timeClass}&limit=${limit}`);
        return response.data;
    }
};

export default api;
