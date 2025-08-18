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
    Grid,
    Typography,
    Button,
    Paper,
    CircularProgress,
    Alert,
    useTheme,
    alpha,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ArrowBack } from '@mui/icons-material';

const SurfaceCard = styled(Box)(({ theme }) => ({
    backgroundColor: alpha(theme.palette.background.paper, 0.7),
    borderRadius: 12,
    padding: theme.spacing(2.5),
    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
    backdropFilter: 'blur(10px)',
    transition: 'background-color 0.2s ease',
    '&:hover': {
        backgroundColor: alpha(theme.palette.background.paper, 0.85),
    }
}));

const StatusLabel = styled(Typography)(({ theme }) => ({
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
    letterSpacing: '0.02em',
}));

const ValueLabel = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    fontSize: '1.1rem',
}));

const BackButton = styled(Button)(({ theme }) => ({
    textTransform: 'none',
    color: theme.palette.primary.main,
    padding: theme.spacing(1, 1),
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: 'transparent',
        color: theme.palette.primary.dark,
        transform: 'translateX(-4px)',
    }
}));

const GamePlay = () => {
    const { id } = useParams<{ id: string }>();
    const gameId = parseInt(id || '0');
    const navigate = useNavigate();
    const { user } = useAuth();
    const theme = useTheme();

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
                    server_now: response.server_now,
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
                <CircularProgress
                    size={60}
                    sx={{ color: theme => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.light})` }}
                />
            </Box>
        );
    }

    if (error || !game || !user) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                height="100vh"
                sx={{
                    position: 'relative',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '500px',
                        height: '500px',
                        borderRadius: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: `radial-gradient(circle, ${alpha(theme.palette.error.light, 0.06)}, transparent 70%)`,
                        zIndex: -1,
                    }
                }}
            >
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                    Error
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, textAlign: 'center', maxWidth: 400 }}>
                    {error || 'Game not found'}
                </Typography>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/')}
                    sx={{
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.main,
                        px: 4,
                        py: 1,
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            borderColor: theme.palette.primary.dark,
                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        }
                    }}
                >
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
        <Container maxWidth="lg" sx={{ py: 5 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <BackButton
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/')}
                >
                    Back to Home
                </BackButton>

                <Box textAlign="right">
                    <StatusLabel>
                        Time Control
                    </StatusLabel>
                    <ValueLabel>
                        {game.timeControl?.name || 'Standard'}
                    </ValueLabel>
                </Box>
            </Box>

            {/* Game status banner */}
            {game.status === 'finished' && (
                <Box
                    sx={{
                        mb: 4,
                        py: 2,
                        px: 3,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 3,
                        backgroundColor: theme => {
                            if (getStatusAlertColor() === 'success') {
                                return alpha(theme.palette.success.main, 0.08);
                            } else if (getStatusAlertColor() === 'error') {
                                return alpha(theme.palette.error.main, 0.08);
                            }
                            return alpha(theme.palette.info.main, 0.08);
                        },
                        border: theme => `1px solid ${alpha(theme.palette[getStatusAlertColor()].main, 0.2)}`,
                    }}
                >
                    <Typography
                        sx={{
                            fontWeight: 600,
                            color: theme => theme.palette[getStatusAlertColor()].main
                        }}
                    >
                        {getGameStatus()}
                    </Typography>
                </Box>
            )}

            <Grid container spacing={4}>
                {/* Left column - player info and timers */}
                <Grid item xs={12} lg={3}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Player info */}
                        <SurfaceCard>
                            <Box mb={2} pb={1.5} sx={{ borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                <StatusLabel>
                                    Playing as
                                </StatusLabel>
                                <ValueLabel>
                                    {playerColor}
                                </ValueLabel>
                            </Box>

                            <Box>
                                <StatusLabel>
                                    Opponent
                                </StatusLabel>
                                <ValueLabel>
                                    {opponent?.name || 'Unknown'}
                                </ValueLabel>
                            </Box>
                        </SurfaceCard>

                        {/* Chess timer */}
                        <SurfaceCard>
                            <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                                Time Remaining
                            </Typography>
                            <ChessTimer
                                whiteMs={game.white_time_ms}
                                blackMs={game.black_time_ms}
                                lastMoveAt={game.last_move_at}
                                toMove={game.to_move}
                                isActive={game.status === 'active'}
                                serverNowIso={game.server_now}
                            />
                        </SurfaceCard>

                        {/* Move list - desktop */}
                        <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
                            <SurfaceCard sx={{ p: 0, overflow: 'hidden' }}>
                                <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        Move History
                                    </Typography>
                                </Box>
                                <MoveList moves={moves} />
                            </SurfaceCard>
                        </Box>

                        {/* Game controls */}
                        {game.status === 'active' && (
                            <SurfaceCard>
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                                    Game Controls
                                </Typography>
                                <GameControls
                                    game={game}
                                    playerId={user.id}
                                    onResign={handleResign}
                                    onOfferDraw={handleOfferDraw}
                                    onAcceptDraw={handleAcceptDraw}
                                />
                            </SurfaceCard>
                        )}
                    </Box>
                </Grid>

                {/* Center column - chessboard */}
                <Grid item xs={12} lg={9}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            position: 'relative',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                width: '100%',
                                height: '50%',
                                background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.03)}, transparent)`,
                                borderRadius: '50%',
                                top: '10%',
                                left: 0,
                                zIndex: -1,
                            }
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                p: 0.5,
                                borderRadius: 2,
                                overflow: 'hidden',
                                backgroundColor: 'transparent',
                                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                            }}
                        >
                            <ChessBoard
                                game={game}
                                moves={moves}
                                playerId={user.id}
                                onMove={handleMove}
                            />
                        </Paper>

                        {/* Mobile view - move list */}
                        <Box mt={4} width="100%" sx={{ display: { xs: 'block', lg: 'none' } }}>
                            <SurfaceCard sx={{ p: 0, overflow: 'hidden' }}>
                                <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        Move History
                                    </Typography>
                                </Box>
                                <MoveList moves={moves} />
                            </SurfaceCard>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default GamePlay;
