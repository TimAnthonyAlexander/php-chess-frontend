import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { gameService } from '../services/api';
import type { Game, GameMove, GameSync } from '../types';
import ChessBoard from '../components/Chess/ChessBoard';
import ChessTimer from '../components/Chess/ChessTimer';
import MoveList from '../components/Chess/MoveList';
import GameControls from '../components/Chess/GameControls';

const GamePlay = () => {
    const { id } = useParams<{ id: string }>();
    const gameId = parseInt(id || '0');
    const navigate = useNavigate();
    const { user } = useAuth();

    const [game, setGame] = useState<Game | null>(null);
    const [moves, setMoves] = useState<GameMove[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lockVersion, setLockVersion] = useState(0);

    // Initial game load
    useEffect(() => {
        const fetchGame = async () => {
            try {
                const response = await gameService.getGame(gameId);
                setGame(response.game);
                setMoves(response.moves);
                setLockVersion(response.game.lock_version);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load game');
                console.error('Error loading game:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGame();
    }, [gameId]);

    // Sync game updates
    const syncGame = useCallback(async () => {
        if (!game) return;

        try {
            const lastMoveIndex = moves.length > 0 ? moves[moves.length - 1].ply : 0;
            const response = await gameService.syncGame(gameId, lastMoveIndex);

            // Update game state
            setGame(prev => {
                if (!prev) return prev;

                return {
                    ...prev,
                    status: response.status,
                    result: response.result,
                    reason: response.reason,
                    lock_version: response.lock_version,
                    white_time_ms: response.white_time_ms,
                    black_time_ms: response.black_time_ms,
                    last_move_at: response.last_move_at,
                };
            });

            // Add new moves
            if (response.moves.length > 0) {
                setMoves(prev => [...prev, ...response.moves]);
            }

            setLockVersion(response.lock_version);
        } catch (err) {
            console.error('Error syncing game:', err);
        }
    }, [game, gameId, moves]);

    // Set up polling
    useEffect(() => {
        if (!game || game.status !== 'active') return;

        const interval = setInterval(() => {
            syncGame();
        }, 2000);

        return () => clearInterval(interval);
    }, [game, syncGame]);

    // Make a move
    const handleMove = async (uci: string, lockVersion: number) => {
        if (!game || !user) return;

        try {
            const response = await gameService.makeMove(gameId, uci, lockVersion);

            if ('finished' in response) {
                // Game ended with this move
                await syncGame();
            } else if ('ok' in response) {
                // Move successful, update lock version
                setLockVersion(response.lock_version);
                await syncGame();
            }
        } catch (err: any) {
            if (err.response?.status === 409) {
                // Handle version conflict or game not active
                await syncGame();
            } else {
                console.error('Error making move:', err);
            }
        }
    };

    // Resign game
    const handleResign = async () => {
        if (!game) return;

        try {
            await gameService.resignGame(gameId);
            await syncGame();
        } catch (err) {
            console.error('Error resigning game:', err);
        }
    };

    // Offer draw
    const handleOfferDraw = async () => {
        if (!game) return;

        try {
            await gameService.offerDraw(gameId);
        } catch (err) {
            console.error('Error offering draw:', err);
        }
    };

    // Accept draw
    const handleAcceptDraw = async () => {
        if (!game) return;

        try {
            await gameService.acceptDraw(gameId);
            await syncGame();
        } catch (err) {
            console.error('Error accepting draw:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !game || !user) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                <p className="mb-6">{error || 'Game not found'}</p>
                <button onClick={() => navigate('/')} className="btn btn-primary">
                    Return Home
                </button>
            </div>
        );
    }

    const opponent = game.white_id === user.id ? game.black : game.white;
    const playerColor = game.white_id === user.id ? 'White' : 'Black';

    const getGameStatus = () => {
        if (game.status === 'active') {
            return 'Game in progress';
        }

        if (game.result === '1-0') {
            return 'White wins by ' + (game.reason || 'unknown');
        } else if (game.result === '0-1') {
            return 'Black wins by ' + (game.reason || 'unknown');
        } else {
            return 'Game drawn by ' + (game.reason || 'unknown');
        }
    };

    const isPlayerWinner = () => {
        if (game.status !== 'finished' || !game.result) return false;

        const isWhite = game.white_id === user.id;
        return (isWhite && game.result === '1-0') || (!isWhite && game.result === '0-1');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => navigate('/')} className="flex items-center text-primary hover:underline">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Home
                </button>

                <div className="text-right">
                    <div className="text-sm text-gray-600">Time Control</div>
                    <div className="font-medium">{game.timeControl?.name || 'Standard'}</div>
                </div>
            </div>

            {/* Game status banner */}
            {game.status === 'finished' && (
                <div
                    className={`mb-6 p-4 rounded-lg text-center font-bold ${isPlayerWinner()
                            ? 'bg-green-100 text-green-800'
                            : game.result === '1/2-1/2'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                >
                    {getGameStatus()}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column - player info and timers */}
                <div className="space-y-6">
                    {/* Player info */}
                    <div className="card">
                        <div className="mb-4 pb-3 border-b border-gray-100">
                            <div className="text-sm text-gray-500">Playing as</div>
                            <div className="font-semibold text-lg">{playerColor}</div>
                        </div>

                        <div>
                            <div className="text-sm text-gray-500">Opponent</div>
                            <div className="font-semibold text-lg">{opponent?.name || 'Unknown'}</div>
                        </div>
                    </div>

                    {/* Chess timer */}
                    <div className="card">
                        <h3 className="font-medium mb-4">Time Remaining</h3>
                        <ChessTimer
                            game={game}
                            playerId={user.id}
                            lastMoveAt={game.last_move_at}
                            isActive={game.status === 'active'}
                        />
                    </div>

                    {/* Move list */}
                    <div className="hidden lg:block">
                        <MoveList moves={moves} />
                    </div>

                    {/* Game controls */}
                    {game.status === 'active' && (
                        <div className="card">
                            <h3 className="font-medium mb-4">Game Controls</h3>
                            <GameControls
                                game={game}
                                playerId={user.id}
                                onResign={handleResign}
                                onOfferDraw={handleOfferDraw}
                                onAcceptDraw={handleAcceptDraw}
                            />
                        </div>
                    )}
                </div>

                {/* Center column - chessboard */}
                <div className="lg:col-span-2 flex flex-col items-center">
                    <ChessBoard
                        game={game}
                        moves={moves}
                        playerId={user.id}
                        onMove={handleMove}
                    />

                    {/* Mobile view - move list */}
                    <div className="mt-6 w-full lg:hidden">
                        <MoveList moves={moves} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GamePlay;
