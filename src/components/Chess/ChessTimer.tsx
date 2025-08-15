import { useState, useEffect } from 'react';
import type { Game } from '../../types';

interface ChessTimerProps {
    game: Game;
    playerId: number;
    lastMoveAt: string | null;
    isActive: boolean;
}

const ChessTimer: React.FC<ChessTimerProps> = ({ game, playerId, lastMoveAt, isActive }) => {
    const isWhite = game.white_id === playerId;
    const [whiteTime, setWhiteTime] = useState(game.white_time_ms);
    const [blackTime, setBlackTime] = useState(game.black_time_ms);

    // Format time display
    const formatTime = (timeMs: number): string => {
        const totalSeconds = Math.max(0, Math.floor(timeMs / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Update timers
    useEffect(() => {
        setWhiteTime(game.white_time_ms);
        setBlackTime(game.black_time_ms);
    }, [game.white_time_ms, game.black_time_ms]);

    // Timer countdown effect
    useEffect(() => {
        if (!isActive || game.status !== 'active' || !lastMoveAt) {
            return;
        }

        const isWhiteTurn = game.move_index % 2 === 0;
        const lastMoveTime = new Date(lastMoveAt).getTime();
        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = now - lastMoveTime;

            if (isWhiteTurn) {
                setWhiteTime(Math.max(0, game.white_time_ms - elapsed));
            } else {
                setBlackTime(Math.max(0, game.black_time_ms - elapsed));
            }
        }, 100);

        return () => clearInterval(interval);
    }, [game, isActive, lastMoveAt]);

    return (
        <div className="grid grid-cols-2 gap-4">
            <div
                className={`p-3 rounded-lg ${game.move_index % 2 === 0 && game.status === 'active'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100'
                    } ${isWhite ? 'order-1' : 'order-2'}`}
            >
                <div className="text-sm font-medium">White</div>
                <div className="text-xl font-bold">{formatTime(whiteTime)}</div>
            </div>

            <div
                className={`p-3 rounded-lg ${game.move_index % 2 === 1 && game.status === 'active'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100'
                    } ${isWhite ? 'order-2' : 'order-1'}`}
            >
                <div className="text-sm font-medium">Black</div>
                <div className="text-xl font-bold">{formatTime(blackTime)}</div>
            </div>
        </div>
    );
};

export default ChessTimer;
