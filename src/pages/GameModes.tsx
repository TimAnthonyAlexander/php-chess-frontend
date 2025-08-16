import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { modeService, queueService } from '../services/api';
import type { TimeControl, QueueStatus } from '../types';
import { 
    Typography, 
    Container, 
    GridLegacy as Grid, 
    Card, 
    CardContent, 
    CardActionArea, 
    CircularProgress, 
    Button, 
    Box, 
    Alert, 
    Divider,
    alpha,
    useTheme
} from '@mui/material';

const GameModes = () => {
    const theme = useTheme();
    const [timeControls, setTimeControls] = useState<TimeControl[]>([]);
    const [selectedMode, setSelectedMode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isJoiningQueue, setIsJoiningQueue] = useState(false);
    const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
    const [queueTime, setQueueTime] = useState(0);
    const [pollingInterval, setPollingInterval] = useState<ReturnType<typeof setInterval> | null>(null);

    const navigate = useNavigate();

    // Load time controls
    useEffect(() => {
        const fetchTimeControls = async () => {
            try {
                const response = await modeService.getTimeControls();
                setTimeControls(response);
            } catch (err) {
                setError('Failed to load game modes');
                console.error('Error loading time controls:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTimeControls();
    }, []);

    // Handle queue updates
    useEffect(() => {
        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, [pollingInterval]);

    // Handle queue timer
    useEffect(() => {
        if (!isJoiningQueue) {
            setQueueTime(0);
            return;
        }

        const timer = setInterval(() => {
            setQueueTime(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [isJoiningQueue]);

    // Join queue for selected time control
    const handleJoinQueue = async () => {
        if (!selectedMode) return;

        setIsJoiningQueue(true);

        try {
            const status = await queueService.joinQueue(selectedMode);
            setQueueStatus(status);

            if (status.status === 'matched') {
                // Game found, navigate to game page
                navigate(`/game/${status.game_id}`);
                return;
            }

            // If not immediately matched, start polling for status
            const interval = setInterval(async () => {
                try {
                    const updatedStatus = await queueService.joinQueue(selectedMode);
                    setQueueStatus(updatedStatus);

                    if (updatedStatus.status === 'matched') {
                        clearInterval(interval);
                        navigate(`/game/${updatedStatus.game_id}`);
                    }
                } catch (err) {
                    console.error('Error polling queue status:', err);
                }
            }, 2000);

            setPollingInterval(interval);

        } catch (err) {
            setError('Failed to join queue');
            setIsJoiningQueue(false);
            console.error('Error joining queue:', err);
        }
    };

    // Leave queue
    const handleLeaveQueue = async () => {
        if (!selectedMode) return;

        try {
            await queueService.leaveQueue(selectedMode);

            if (pollingInterval) {
                clearInterval(pollingInterval);
                setPollingInterval(null);
            }

        } catch (err) {
            console.error('Error leaving queue:', err);
        } finally {
            setIsJoiningQueue(false);
            setQueueStatus(null);
            setQueueTime(0);
        }
    };

    // Format queue time display
    const formatQueueTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    // Group time controls by category for better display
    const groupedTimeControls = timeControls.reduce<Record<string, TimeControl[]>>((acc, tc) => {
        if (!acc[tc.time_class]) {
            acc[tc.time_class] = [];
        }
        acc[tc.time_class].push(tc);
        return acc;
    }, {});

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                    mb: 3,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}
            >
                Play Chess
            </Typography>

            {isJoiningQueue ? (
                <Box
                    sx={{
                        p: 5,
                        textAlign: 'center',
                        borderRadius: 3,
                        background: `linear-gradient(to bottom right, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.9)})`,
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.05)}`
                    }}>
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                mb: 2, 
                                fontWeight: 500,
                                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '-0.02em'
                            }}
                        >
                            Finding opponent...
                        </Typography>
                        <Typography 
                            variant="h3" 
                            sx={{ 
                                mb: 3, 
                                fontWeight: 600, 
                                letterSpacing: '-0.025em',
                                color: theme.palette.primary.main
                            }}
                        >
                            {formatQueueTime(queueTime)}
                        </Typography>

                        {queueStatus?.widening && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Search range: ±{queueStatus.widening.delta} Elo
                            </Typography>
                        )}

                        <Box sx={{ mb: 4, display: 'flex' }}>
                            <Box sx={{
                                animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                '@keyframes pulse': {
                                    '0%, 100%': { opacity: 1 },
                                    '50%': { opacity: 0.5 }
                                },
                                display: 'flex',
                                gap: 1.5
                            }}>
                                {[0, 1, 2].map((i) => (
                                    <Box 
                                        key={i}
                                        sx={{ 
                                            width: 10, 
                                            height: 10, 
                                            borderRadius: '50%',
                                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                                            animationDelay: `${i * 0.15}s`,
                                            animation: `bounce 1.4s infinite ease-in-out ${i * 0.15}s`,
                                            '@keyframes bounce': {
                                                '0%, 100%': {
                                                    transform: 'translateY(0)'
                                                },
                                                '50%': {
                                                    transform: 'translateY(-6px)'
                                                }
                                            }
                                        }} 
                                    />
                                ))}
                            </Box>
                        </Box>

                        <Button
                            onClick={handleLeaveQueue}
                            variant="outlined"
                            color="error"
                            size="large"
                            sx={{
                                px: 4,
                                py: 1.25,
                                borderRadius: 28,
                                textTransform: 'none',
                                fontWeight: 500,
                                letterSpacing: '0.01em',
                                transition: 'all 0.2s ease',
                                borderWidth: 0,
                                color: theme.palette.error.main,
                                bgcolor: alpha(theme.palette.error.main, 0.08),
                                '&:hover': {
                                    borderWidth: 0,
                                    bgcolor: alpha(theme.palette.error.main, 0.12),
                                    transform: 'translateY(-1px)',
                                }
                            }}
                        >
                            Cancel Search
                        </Button>
                    </Box>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {Object.entries(groupedTimeControls).map(([timeClass, controls]) => (
                        <Grid item xs={12} md={6} key={timeClass}>
                            <Box
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    background: `linear-gradient(to bottom right, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.9)})`,
                                    backdropFilter: 'blur(10px)',
                                    border: `1px solid ${alpha(theme.palette.divider, 0.05)}`
                                }}>
                                <Typography 
                                    variant="h5" 
                                    sx={{ 
                                        mb: 2, 
                                        textTransform: 'capitalize',
                                        fontWeight: 600,
                                        letterSpacing: '-0.01em',
                                        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    {timeClass}
                                </Typography>
                                <Divider sx={{ mb: 2.5, opacity: 0.5 }} />

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {controls.map((tc) => (
                                        <Box
                                            key={tc.id}
                                            sx={{
                                                borderRadius: 2.5,
                                                bgcolor: selectedMode === tc.slug 
                                                    ? alpha(theme.palette.primary.light, 0.08)
                                                    : alpha(theme.palette.background.paper, 0.8),
                                                border: `1px solid ${selectedMode === tc.slug 
                                                    ? alpha(theme.palette.primary.main, 0.1)
                                                    : alpha(theme.palette.divider, 0.08)}`,
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    bgcolor: selectedMode === tc.slug
                                                        ? alpha(theme.palette.primary.light, 0.1)
                                                        : alpha(theme.palette.primary.light, 0.02)
                                                },
                                                backgroundImage: selectedMode === tc.slug 
                                                    ? `linear-gradient(to right, ${alpha(theme.palette.primary.light, 0.15)}, ${alpha(theme.palette.primary.light, 0.05)})`
                                                    : 'none'
                                            }}
                                        >
                                            <Box 
                                                onClick={() => setSelectedMode(tc.slug)}
                                                sx={{ 
                                                    p: 2.5,
                                                    display: 'flex', 
                                                    justifyContent: 'space-between', 
                                                    alignItems: 'center',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        '& .time-text': {
                                                            color: theme.palette.primary.main
                                                        }
                                                    }
                                                }}
                                            >
                                                <Box>
                                                    <Typography 
                                                        variant="h6" 
                                                        sx={{ 
                                                            fontWeight: selectedMode === tc.slug ? 600 : 500,
                                                            color: selectedMode === tc.slug 
                                                                ? theme.palette.primary.main 
                                                                : theme.palette.text.primary,
                                                            letterSpacing: '-0.01em',
                                                            mb: 0.5
                                                        }}
                                                    >
                                                        {tc.name}
                                                    </Typography>
                                                    <Typography 
                                                        variant="body2" 
                                                        className="time-text"
                                                        sx={{ 
                                                            color: selectedMode === tc.slug 
                                                                ? alpha(theme.palette.primary.main, 0.7) 
                                                                : 'text.secondary',
                                                            transition: 'color 0.2s ease',
                                                            fontWeight: 400
                                                        }}
                                                    >
                                                        {Math.floor(tc.initial_sec / 60)}min {tc.initial_sec % 60}s + {tc.increment_ms / 1000}s
                                                    </Typography>
                                                </Box>

                                                {selectedMode === tc.slug && (
                                                    <Box 
                                                        sx={{
                                                            width: 20,
                                                            height: 20,
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                        }}
                                                    >
                                                        <Box 
                                                            sx={{
                                                                width: 8,
                                                                height: 8,
                                                                borderRadius: '50%',
                                                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                                                                transition: 'all 0.2s ease-in-out',
                                                            }} 
                                                        />
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Grid>
                    ))}

                    {/* Placeholder if no time controls are loaded or available */}
                    {Object.keys(groupedTimeControls).length === 0 && !isLoading && (
                        <Grid item xs={12}>
                            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                                No game modes available
                            </Typography>
                        </Grid>
                    )}

                    {/* Loading state */}
                    {isLoading && (
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={48} />
                        </Grid>
                    )}
                </Grid>
            )}

            {/* Play button */}
            {!isJoiningQueue && !isLoading && selectedMode && (
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Button
                        onClick={handleJoinQueue}
                        variant="contained"
                        color="primary"
                        size="large"
                        sx={{
                            px: 5,
                            py: 1.5,
                            fontSize: '1.1rem',
                            borderRadius: 28,
                            textTransform: 'none',
                            fontWeight: 500,
                            letterSpacing: '0.01em',
                            transition: 'all 0.2s ease',
                            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
                            boxShadow: 'none',
                            '&:hover': {
                                background: `linear-gradient(90deg, ${theme.palette.primary.main} 10%, ${alpha(theme.palette.primary.main, 0.9)} 100%)`,
                                boxShadow: `0px 2px 8px ${alpha(theme.palette.primary.main, 0.25)}`,
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        Find Game
                    </Button>
                </Box>
            )}

            {/* Error message */}
            {error && (
                <Alert severity="error" sx={{ mt: 3 }}>
                    {error}
                </Alert>
            )}
        </Container>
    );
};

export default GameModes;
