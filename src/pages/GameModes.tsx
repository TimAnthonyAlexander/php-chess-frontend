import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { modeService, queueService } from '../services/api';
import type { TimeControl, QueueStatus } from '../types';
import { Typography, Container, Paper, Grid, Card, CardContent, CardActionArea, CircularProgress, Button, Box, Alert, Divider } from '@mui/material';

const GameModes = () => {
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
                    letterSpacing: '-0.01em',
                    color: 'text.primary',
                    mb: 3
                }}
            >
                Play Chess
            </Typography>

            {isJoiningQueue ? (
                <Paper
                    elevation={0}
                    sx={{
                        p: 5,
                        textAlign: 'center',
                        borderRadius: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)'
                    }}>
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <Typography variant="h5" sx={{ mb: 2 }}>Finding opponent...</Typography>
                        <Typography variant="h3" sx={{ mb: 3, fontWeight: 'bold' }}>{formatQueueTime(queueTime)}</Typography>

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
                                gap: 1
                            }}>
                                <Box sx={{ width: 8, height: 8, bgcolor: 'primary.main', borderRadius: '50%' }} />
                                <Box sx={{ width: 8, height: 8, bgcolor: 'primary.main', borderRadius: '50%' }} />
                                <Box sx={{ width: 8, height: 8, bgcolor: 'primary.main', borderRadius: '50%' }} />
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
                                borderWidth: 1.5,
                                letterSpacing: '0.01em',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    borderWidth: 1.5,
                                    backgroundColor: 'rgba(211, 47, 47, 0.04)'
                                }
                            }}
                        >
                            Cancel Search
                        </Button>
                    </Box>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {Object.entries(groupedTimeControls).map(([timeClass, controls]) => (
                        <Grid item xs={12} md={6} key={timeClass}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(10px)',
                                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)'
                                }}>
                                <Typography variant="h5" sx={{ mb: 2, textTransform: 'capitalize' }}>
                                    {timeClass}
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {controls.map((tc) => (
                                        <Card
                                            key={tc.id}
                                            elevation={selectedMode === tc.slug ? 2 : 0}
                                            sx={{
                                                border: 0,
                                                borderRadius: 2,
                                                bgcolor: selectedMode === tc.slug ? 'rgba(25, 118, 210, 0.04)' : 'background.paper',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                '&:hover': {
                                                    bgcolor: selectedMode === tc.slug
                                                        ? 'rgba(25, 118, 210, 0.08)'
                                                        : 'rgba(0, 0, 0, 0.02)'
                                                },
                                                '&:before': selectedMode === tc.slug ? {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '4px',
                                                    height: '100%',
                                                    bgcolor: 'primary.main',
                                                    borderTopLeftRadius: 4,
                                                    borderBottomLeftRadius: 4,
                                                } : {}
                                            }}
                                        >
                                            <CardActionArea onClick={() => setSelectedMode(tc.slug)}>
                                                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Box>
                                                        <Typography variant="h6">{tc.name}</Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {Math.floor(tc.initial_sec / 60)}min {tc.initial_sec % 60}s + {tc.increment_ms / 1000}s
                                                        </Typography>
                                                    </Box>

                                                    {selectedMode === tc.slug && (
                                                        <Box sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 0.75
                                                        }}>
                                                            <Box sx={{
                                                                width: 6,
                                                                height: 6,
                                                                borderRadius: '50%',
                                                                bgcolor: 'primary.main',
                                                                boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                                                                transition: 'all 0.2s ease-in-out',
                                                            }} />
                                                        </Box>
                                                    )}
                                                </CardContent>
                                            </CardActionArea>
                                        </Card>
                                    ))}
                                </Box>
                            </Paper>
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
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                            letterSpacing: '0.01em',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                                transform: 'translateY(-1px)'
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
