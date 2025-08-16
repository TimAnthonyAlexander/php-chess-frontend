import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { gameService } from '../services/api';
import type { Game, GameMove, ApiError } from '../types';
import ChessBoard from '../components/Chess/ChessBoard';
import ChessTimer from '../components/Chess/ChessTimer';
import MoveList from '../components/Chess/MoveList';
import GameControls from '../components/Chess/GameControls';
import {
    Container,
    Box,
    GridLegacy as Grid,
    Typography,
    Button,
    Paper,
    CircularProgress,
    Alert,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

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
            } catch (err: unknown) {
                const error = err as ApiError;
                setError(error.message || 'Failed to load game');
                console.error('Error loading game:', error);
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
                    status: response.status as 'active' | 'finished',
                    result: response.result,
                    reason: response.reason,
                    lock_version: response.lock_version,
                    white_time_ms: response.white_time_ms,
                    black_time_ms: response.black_time_ms,
                    last_move_at: response.last_move_at,
                    to_move: response.to_move,
                    to_move_user_id: response.to_move_user_id,
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
        console.log('Making move:', uci, 'with lock version:', lockVersion);
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
        } catch (err: unknown) {
            const error = err as Error;
            if ((err as any).response?.status === 409) {
                // Handle version conflict or game not active
                await syncGame();
            } else {
                console.error('Error making move:', error);
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
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !game || !user) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
                <Typography variant="h5" color="error" gutterBottom fontWeight="bold">
                    Error
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                    {error || 'Game not found'}
                </Typography>
                <Button variant="contained" color="primary" onClick={() => navigate('/')}>
                    Return Home
                </Button>
            </Box>
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

    const getStatusAlertColor = () => {
        if (isPlayerWinner()) return 'success';
        if (game.result === '1/2-1/2') return 'info';
        return 'error';
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/')}
                    color="primary"
                    sx={{
                        textTransform: 'none',
                        '&:hover': {
                            backgroundColor: 'transparent',
                            textDecoration: 'underline'
                        }
                    }}
                >
                    Back to Home
                </Button>

                <Box textAlign="right">
                    <Typography variant="caption" color="text.secondary">
                        Time Control
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                        {game.timeControl?.name || 'Standard'}
                    </Typography>
                </Box>
            </Box>

            {/* Game status banner */}
            {game.status === 'finished' && (
                <Alert
                    severity={getStatusAlertColor()}
                    sx={{
                        mb: 3,
                        justifyContent: 'center',
                        borderRadius: 2,
                        '& .MuiAlert-message': {
                            fontWeight: 'bold'
                        }
                    }}
                >
                    {getGameStatus()}
                </Alert>
            )}

            <Grid container spacing={4}>
                {/* Left column - player info and timers */}
                <Grid item xs={12} lg={3}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Player info */}
                        <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                            <Box mb={2} pb={1} sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
                                <Typography variant="caption" color="text.secondary">
                                    Playing as
                                </Typography>
                                <Typography variant="body1" fontWeight={600} fontSize="1.1rem">
                                    {playerColor}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Opponent
                                </Typography>
                                <Typography variant="body1" fontWeight={600} fontSize="1.1rem">
                                    {opponent?.name || 'Unknown'}
                                </Typography>
                            </Box>
                        </Paper>

                        {/* Chess timer */}
                        <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                            <Typography variant="body1" fontWeight={500} mb={2}>
                                Time Remaining
                            </Typography>
                            <ChessTimer
                                game={game}
                                playerId={user.id}
                                lastMoveAt={game.last_move_at}
                                isActive={game.status === 'active'}
                            />
                        </Paper>

                        {/* Move list - desktop */}
                        <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
                            <MoveList moves={moves} />
                        </Box>

                        {/* Game controls */}
                        {game.status === 'active' && (
                            <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="body1" fontWeight={500} mb={2}>
                                    Game Controls
                                </Typography>
                                <GameControls
                                    game={game}
                                    playerId={user.id}
                                    onResign={handleResign}
                                    onOfferDraw={handleOfferDraw}
                                    onAcceptDraw={handleAcceptDraw}
                                />
                            </Paper>
                        )}
                    </Box>
                </Grid>

                {/* Center column - chessboard */}
                <Grid item xs={12} lg={9}>
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <ChessBoard
                            game={game}
                            moves={moves}
                            playerId={user.id}
                            onMove={handleMove}
                        />

                        {/* Mobile view - move list */}
                        <Box mt={3} width="100%" sx={{ display: { xs: 'block', lg: 'none' } }}>
                            <MoveList moves={moves} />
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default GamePlay;
