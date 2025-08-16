import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { userService, leaderboardService } from '../services/api';
import type { Game, PlayerRating } from '../types';
import { useAuth } from '../hooks/useAuth';
import {
    Box,
    Button,
    ButtonGroup,
    Card,
    CardHeader,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    GridLegacy as Grid,
    Link,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const Home = () => {
    const theme = useTheme();
    const [activeGameId, setActiveGameId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [recentGames, setRecentGames] = useState<Game[]>([]);
    const [leaderboard, setLeaderboard] = useState<PlayerRating[]>([]);
    const [selectedTimeClass, setSelectedTimeClass] = useState('rapid');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [activeGameRes, recentGamesRes, leaderboardRes] = await Promise.all([
                    userService.getActiveGame(),
                    userService.getRecentGames(),
                    leaderboardService.getLeaderboard(selectedTimeClass, 10)
                ]);

                setActiveGameId(activeGameRes.game_id);
                setRecentGames(recentGamesRes);
                setLeaderboard(leaderboardRes);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [selectedTimeClass]);

    const formatResult = (game: Game): { text: string, color: string } => {
        if (!game.result) return { text: 'In Progress', color: 'default' };

        const isWhite = user?.id === game.white_id;

        if (game.result === '1-0') {
            return isWhite
                ? { text: 'Win', color: 'success' }
                : { text: 'Loss', color: 'error' };
        } else if (game.result === '0-1') {
            return isWhite
                ? { text: 'Loss', color: 'error' }
                : { text: 'Win', color: 'success' };
        } else {
            return { text: 'Draw', color: 'default' };
        }
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString();
    };

    const handlePlayNow = () => {
        if (activeGameId) {
            navigate(`/game/${activeGameId}`);
        } else {
            navigate('/play');
        }
    };

    const handleTimeClassChange = (timeClass: string) => {
        setSelectedTimeClass(timeClass);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Grid container spacing={3}>
            {/* Main section - Left Side */}
            <Grid item xs={12} lg={8}>
                <Grid container spacing={3} direction="column">
                    {/* Welcome and Play Section */}
                    <Grid item>
                        <Box 
                            sx={{ 
                                bgcolor: 'background.paper',
                                borderRadius: 3,
                                overflow: 'hidden',
                                position: 'relative',
                                backgroundImage: `linear-gradient(to bottom right, ${alpha(theme.palette.primary.light, 0.05)}, ${alpha('#fff', 1)})`,
                            }}
                        >
                            <Box sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography 
                                        variant="h5" 
                                        component="h1" 
                                        sx={{ 
                                            fontWeight: 600, 
                                            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            letterSpacing: '-0.02em'
                                        }}
                                    >
                                        Welcome, {user?.name}!
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handlePlayNow}
                                        startIcon={<PlayArrowIcon />}
                                        sx={{
                                            borderRadius: '12px',
                                            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
                                            boxShadow: 'none',
                                            textTransform: 'none',
                                            fontWeight: 500,
                                            py: 1,
                                            px: 2,
                                            '&:hover': {
                                                background: `linear-gradient(90deg, ${theme.palette.primary.main} 10%, ${alpha(theme.palette.primary.main, 0.9)} 100%)`,
                                                boxShadow: `0px 2px 8px ${alpha(theme.palette.primary.main, 0.25)}`,
                                            }
                                        }}
                                    >
                                        {activeGameId ? 'Resume Game' : 'Play Now'}
                                    </Button>
                                </Box>

                                {activeGameId && (
                                    <Box
                                        sx={{
                                            p: 2,
                                            bgcolor: alpha(theme.palette.primary.light, 0.05),
                                            borderRadius: 1,
                                            border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            You have an active game
                                        </Typography>
                                        <Link
                                            component={RouterLink}
                                            to={`/game/${activeGameId}`}
                                            color="primary"
                                            sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}
                                        >
                                            Continue playing <ArrowForwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                                        </Link>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Grid>

                    {/* Recent Games */}
                    <Grid item>
                        <Box
                            sx={{ 
                                bgcolor: 'background.paper',
                                borderRadius: 3,
                                overflow: 'hidden',
                                position: 'relative',
                                backgroundImage: `linear-gradient(to bottom right, ${alpha(theme.palette.primary.light, 0.02)}, ${alpha('#fff', 1)})`,
                            }}
                        >
                            <Box 
                                sx={{ 
                                    p: 2.5, 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        fontWeight: 600,
                                        letterSpacing: '-0.01em'
                                    }}
                                >
                                    Recent Games
                                </Typography>
                                <Button
                                    component={RouterLink}
                                    to="/history"
                                    color="primary"
                                    size="small"
                                    endIcon={<ArrowForwardIcon />}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        px: 1.5,
                                    }}
                                >
                                    View all
                                </Button>
                            </Box>
                            <Divider sx={{ opacity: 0.5 }} />
                            <Box sx={{ pt: 2, px: 0, pb: 0 }}>
                                {recentGames.length === 0 ? (
                                    <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                                        No recent games found.
                                    </Typography>
                                ) : (
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Date</TableCell>
                                                    <TableCell>Opponent</TableCell>
                                                    <TableCell>Time Control</TableCell>
                                                    <TableCell>Result</TableCell>
                                                    <TableCell align="right">Action</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {recentGames.slice(0, 5).map((game) => {
                                                    const isWhite = user?.id === game.white_id;
                                                    const opponent = isWhite ? game.black : game.white;
                                                    const result = formatResult(game);

                                                    return (
                                                        <TableRow key={game.id} hover>
                                                            <TableCell>{formatDate(game.created_at)}</TableCell>
                                                            <TableCell sx={{ fontWeight: 500 }}>
                                                                {opponent?.name || 'Unknown'}
                                                            </TableCell>
                                                            <TableCell>{game.timeControl?.name || ''}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={result.text}
                                                                    color={result.color as 'default' | 'success' | 'error'}
                                                                    size="small"
                                                                    sx={{
                                                                        borderRadius: '12px',
                                                                        fontWeight: 500,
                                                                        color: result.color === 'success' 
                                                                            ? theme.palette.success.main 
                                                                            : result.color === 'error' 
                                                                                ? theme.palette.error.main 
                                                                                : theme.palette.text.primary,
                                                                        bgcolor: result.color === 'success' 
                                                                            ? alpha(theme.palette.success.main, 0.1)
                                                                            : result.color === 'error'
                                                                                ? alpha(theme.palette.error.main, 0.1)
                                                                                : alpha(theme.palette.primary.main, 0.05),
                                                                        border: 'none'
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Button
                                                                    component={RouterLink}
                                                                    to={`/game/${game.id}`}
                                                                    color="primary"
                                                                    size="small"
                                                                    startIcon={<VisibilityIcon fontSize="small" />}
                                                                    sx={{
                                                                        textTransform: 'none',
                                                                        fontWeight: 500,
                                                                        borderRadius: '12px',
                                                                        px: 1.5,
                                                                        py: 0.5,
                                                                        '&:hover': {
                                                                            bgcolor: alpha(theme.palette.primary.main, 0.08)
                                                                        }
                                                                    }}
                                                                >
                                                                    View
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Grid>

            {/* Sidebar - Right Side */}
            <Grid item xs={12} lg={4}>
                <Grid container spacing={3} direction="column">
                    {/* Leaderboard */}
                    <Grid item>
                        <Box
                            sx={{ 
                                bgcolor: 'background.paper',
                                borderRadius: 3,
                                overflow: 'hidden',
                                position: 'relative',
                                backgroundImage: `linear-gradient(to bottom right, ${alpha(theme.palette.primary.light, 0.02)}, ${alpha('#fff', 1)})`,
                            }}
                        >
                            <Box sx={{ p: 2.5 }}>
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        fontWeight: 600,
                                        letterSpacing: '-0.01em',
                                        mb: 0
                                    }}
                                >
                                    Leaderboard
                                </Typography>
                            </Box>
                            <Divider sx={{ opacity: 0.5 }} />
                            <Box sx={{ pt: 2.5, px: 2.5 }}>
                                <Box 
                                    sx={{ 
                                        display: 'flex', 
                                        borderRadius: 8, 
                                        bgcolor: alpha(theme.palette.primary.light, 0.05),
                                        p: 0.5,
                                        mb: 3
                                    }}
                                >
                                    {['bullet', 'blitz', 'rapid', 'classical'].map((timeClass) => (
                                        <Button
                                            key={timeClass}
                                            onClick={() => handleTimeClassChange(timeClass)}
                                            sx={{
                                                borderRadius: '16px',
                                                textTransform: 'none',
                                                flex: 1,
                                                py: 0.75,
                                                color: selectedTimeClass === timeClass 
                                                    ? 'primary.contrastText' 
                                                    : 'text.primary',
                                                bgcolor: selectedTimeClass === timeClass 
                                                    ? 'primary.main' 
                                                    : 'transparent',
                                                fontWeight: selectedTimeClass === timeClass ? 600 : 400,
                                                '&:hover': {
                                                    bgcolor: selectedTimeClass === timeClass 
                                                        ? 'primary.main' 
                                                        : alpha(theme.palette.primary.main, 0.08)
                                                },
                                                transition: 'all 0.2s ease-in-out',
                                            }}
                                        >
                                            {timeClass.charAt(0).toUpperCase() + timeClass.slice(1)}
                                        </Button>
                                    ))}
                                </Box>

                                {leaderboard.length === 0 ? (
                                    <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                                        No leaderboard data available.
                                    </Typography>
                                ) : (
                                    <TableContainer 
                                        component={Box} 
                                        sx={{
                                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                            borderRadius: 2,
                                            overflow: 'hidden'
                                        }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Rank</TableCell>
                                                    <TableCell>Player</TableCell>
                                                    <TableCell align="right">Rating</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {leaderboard.map((entry, index) => (
                                                                                                            <TableRow
                                                        key={entry.id}
                                                        sx={{
                                                            bgcolor: user?.id === entry.user_id ? alpha(theme.palette.primary.light, 0.1) : 'inherit',
                                                            '&:hover': {
                                                                bgcolor: alpha(theme.palette.primary.light, 0.05)
                                                            }
                                                        }}
                                                    >
                                                        <TableCell>{index + 1}</TableCell>
                                                        <TableCell>{entry.user?.name || 'Unknown'}</TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                                            {entry.rating}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </Box>
                        </Box>
                    </Grid>

                    {/* Quick Links */}
                    <Grid item>
                        <Box
                            sx={{ 
                                bgcolor: 'background.paper',
                                borderRadius: 3,
                                overflow: 'hidden',
                                position: 'relative',
                                backgroundImage: `linear-gradient(to bottom right, ${alpha(theme.palette.primary.light, 0.02)}, ${alpha('#fff', 1)})`,
                            }}
                        >
                            <Box sx={{ p: 2.5 }}>
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        fontWeight: 600,
                                        letterSpacing: '-0.01em',
                                        mb: 0
                                    }}
                                >
                                    Quick Links
                                </Typography>
                            </Box>
                            <Divider sx={{ opacity: 0.5 }} />
                            <Box sx={{ p: 2.5 }}>
                                <Grid container spacing={2} direction="column">
                                    <Grid item>
                                        <Box
                                            sx={{
                                                p: 0,
                                                borderRadius: 3,
                                                overflow: 'hidden',
                                                position: 'relative',
                                                transition: 'all 0.2s ease-in-out',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    '& .link-bg': {
                                                        opacity: 1,
                                                    }
                                                },
                                            }}
                                        >
                                            <Link
                                                component={RouterLink}
                                                to="/play"
                                                color="inherit"
                                                underline="none"
                                                sx={{
                                                    display: 'block',
                                                    position: 'relative',
                                                    p: 2.5,
                                                    zIndex: 1,
                                                }}
                                            >
                                                <Box
                                                    className="link-bg"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.08)}, ${alpha(theme.palette.primary.main, 0.03)})`,
                                                        opacity: 0.8,
                                                        transition: 'opacity 0.2s ease-in-out',
                                                        zIndex: -1,
                                                    }}
                                                />
                                                <Typography 
                                                    fontWeight={600} 
                                                    gutterBottom
                                                    sx={{ 
                                                        color: theme.palette.primary.main,
                                                        letterSpacing: '-0.01em'
                                                    }}
                                                >
                                                    Find a Game
                                                </Typography>
                                                <Typography 
                                                    variant="body2" 
                                                    color="text.secondary"
                                                    sx={{ opacity: 0.8 }}
                                                >
                                                    Join the queue to play
                                                </Typography>
                                            </Link>
                                        </Box>
                                    </Grid>

                                    <Grid item>
                                        <Box
                                            sx={{
                                                p: 0,
                                                borderRadius: 3,
                                                overflow: 'hidden',
                                                position: 'relative',
                                                transition: 'all 0.2s ease-in-out',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    '& .link-bg': {
                                                        opacity: 1,
                                                    }
                                                },
                                            }}
                                        >
                                            <Link
                                                component={RouterLink}
                                                to="/profile"
                                                color="inherit"
                                                underline="none"
                                                sx={{
                                                    display: 'block',
                                                    position: 'relative',
                                                    p: 2.5,
                                                    zIndex: 1,
                                                }}
                                            >
                                                <Box
                                                    className="link-bg"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.08)}, ${alpha(theme.palette.primary.main, 0.03)})`,
                                                        opacity: 0.8,
                                                        transition: 'opacity 0.2s ease-in-out',
                                                        zIndex: -1,
                                                    }}
                                                />
                                                <Typography 
                                                    fontWeight={600} 
                                                    gutterBottom
                                                    sx={{ 
                                                        color: theme.palette.primary.main,
                                                        letterSpacing: '-0.01em'
                                                    }}
                                                >
                                                    Your Profile
                                                </Typography>
                                                <Typography 
                                                    variant="body2" 
                                                    color="text.secondary"
                                                    sx={{ opacity: 0.8 }}
                                                >
                                                    View your stats and ratings
                                                </Typography>
                                            </Link>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default Home;
