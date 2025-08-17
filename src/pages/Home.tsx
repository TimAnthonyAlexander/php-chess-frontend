import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { userService, leaderboardService } from '../services/api';
import type { Game, PlayerRating } from '../types';
import { useAuth } from '../hooks/useAuth';
import {
    Box,
    Button,
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
                    leaderboardService.getLeaderboard(selectedTimeClass, 10),
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

    const formatResult = (game: Game): { text: string; color: 'default' | 'success' | 'error' } => {
        if (!game.result) return { text: 'In Progress', color: 'default' as const };

        const isWhite = user?.id === game.white_id;

        if (game.result === '1-0') {
            return isWhite ? { text: 'Win', color: 'success' } : { text: 'Loss', color: 'error' };
        } else if (game.result === '0-1') {
            return isWhite ? { text: 'Loss', color: 'error' } : { text: 'Win', color: 'success' };
        } else {
            return { text: 'Draw', color: 'default' };
        }
    };

    const formatDate = (dateString: string): string => new Date(dateString).toLocaleDateString();

    const handlePlayNow = () => {
        if (activeGameId) {
            navigate(`/game/${activeGameId}`);
        } else {
            navigate('/play');
        }
    };

    const handleTimeClassChange = (timeClass: string) => setSelectedTimeClass(timeClass);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    const shell = {
        bgcolor: 'background.paper',
        borderRadius: 2, // 8px
        border: `1px solid ${theme.palette.divider}`,
        boxSizing: 'border-box',
    } as const;

    const subtle = (src: string, amt = 0.04) => alpha(src, amt);

    return (
        <Grid container spacing={3} sx={{ padding: 0, }}>
            <Grid item xs={12} lg={8}>
                <Grid
                    container
                    spacing={3}
                    direction="column"
                >
                    <Grid item xs={12}>
                        <Box sx={shell}>
                            <Box
                                sx={{
                                    p: 3,
                                    boxSizing: 'border-box',
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', md: 'row' },
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 2,
                                    }}
                                >
                                    <Typography
                                        variant="h5"
                                        component="h1"
                                        sx={{
                                            fontWeight: 700,
                                            letterSpacing: '-0.02em',
                                            color: 'primary.main',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
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
                                            borderRadius: 2,
                                            px: 2,
                                            py: 1,
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            boxShadow: 'none',
                                            '&:hover': { backgroundColor: subtle(theme.palette.primary.main, 0.16) },
                                        }}
                                    >
                                        {activeGameId ? 'Resume Game' : 'Play Now'}
                                    </Button>
                                </Box>

                                {activeGameId && (
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            border: `1px solid ${theme.palette.divider}`,
                                            bgcolor: subtle(theme.palette.common.white, 0.02),
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            You have an active game
                                        </Typography>
                                        <Link
                                            component={RouterLink}
                                            to={`/game/${activeGameId}`}
                                            color="primary"
                                            sx={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                                        >
                                            Continue playing <ArrowForwardIcon fontSize="small" />
                                        </Link>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={shell}>
                            <Box
                                sx={{
                                    p: 2.5,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                                    Recent Games
                                </Typography>
                                <Button
                                    component={RouterLink}
                                    to="/history"
                                    color="primary"
                                    size="small"
                                    endIcon={<ArrowForwardIcon />}
                                    sx={{ textTransform: 'none', fontWeight: 600, px: 1.5, borderRadius: 2 }}
                                >
                                    View all
                                </Button>
                            </Box>
                            <Divider />
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
                                                        <TableRow
                                                            key={game.id}
                                                            hover
                                                            sx={{
                                                                '&:hover': { backgroundColor: subtle(theme.palette.common.white, 0.02) },
                                                            }}
                                                        >
                                                            <TableCell>{formatDate(game.created_at)}</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>{opponent?.name || 'Unknown'}</TableCell>
                                                            <TableCell>{game.timeControl?.name || ''}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={result.text}
                                                                    color={result.color}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{
                                                                        borderRadius: 2,
                                                                        fontWeight: 600,
                                                                        borderColor:
                                                                            result.color === 'success'
                                                                                ? alpha(theme.palette.success.main, 0.4)
                                                                                : result.color === 'error'
                                                                                    ? alpha(theme.palette.error.main, 0.4)
                                                                                    : alpha(theme.palette.text.primary, 0.24),
                                                                        bgcolor:
                                                                            result.color === 'success'
                                                                                ? alpha(theme.palette.success.main, 0.12)
                                                                                : result.color === 'error'
                                                                                    ? alpha(theme.palette.error.main, 0.12)
                                                                                    : alpha(theme.palette.primary.main, 0.08),
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
                                                                        fontWeight: 600,
                                                                        borderRadius: 2,
                                                                        px: 1.5,
                                                                        py: 0.5,
                                                                        '&:hover': { bgcolor: subtle(theme.palette.primary.main, 0.12) },
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
                        <Box sx={shell}>
                            <Box sx={{ p: 2.5 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.01em', mb: 0 }}>
                                    Leaderboard
                                </Typography>
                            </Box>
                            <Divider />
                            <Box sx={{ pt: 2.5, px: 2.5 }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 0.5,
                                        borderRadius: 2,
                                        p: 0.5,
                                        border: `1px solid ${theme.palette.divider}`,
                                        bgcolor: subtle(theme.palette.common.white, 0.02),
                                        mb: 3,
                                    }}
                                >
                                    {['bullet', 'blitz', 'rapid', 'classical'].map((timeClass) => {
                                        const selected = selectedTimeClass === timeClass;
                                        return (
                                            <Button
                                                key={timeClass}
                                                onClick={() => handleTimeClassChange(timeClass)}
                                                sx={{
                                                    borderRadius: 2,
                                                    textTransform: 'none',
                                                    flex: 1,
                                                    py: 0.75,
                                                    fontWeight: selected ? 700 : 500,
                                                    color: selected ? 'primary.contrastText' : 'text.primary',
                                                    bgcolor: selected ? 'primary.main' : 'transparent',
                                                    '&:hover': { bgcolor: selected ? 'primary.main' : subtle(theme.palette.primary.main, 0.12) },
                                                    transition: 'background-color 120ms cubic-bezier(0.2,0,0,1)',
                                                }}
                                            >
                                                {timeClass.charAt(0).toUpperCase() + timeClass.slice(1)}
                                            </Button>
                                        );
                                    })}
                                </Box>

                                {leaderboard.length === 0 ? (
                                    <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                                        No leaderboard data available.
                                    </Typography>
                                ) : (
                                    <TableContainer
                                        component={Box}
                                        sx={{
                                            border: `1px solid ${theme.palette.divider}`,
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                        }}
                                    >
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
                                                            bgcolor:
                                                                user?.id === entry.user_id ? subtle(theme.palette.primary.main, 0.12) : 'inherit',
                                                            '&:hover': { bgcolor: subtle(theme.palette.common.white, 0.02) },
                                                        }}
                                                    >
                                                        <TableCell>{index + 1}</TableCell>
                                                        <TableCell>{entry.user?.name || 'Unknown'}</TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 700 }}>
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
                        <Box sx={shell}>
                            <Box sx={{ p: 2.5 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.01em', mb: 0 }}>
                                    Quick Links
                                </Typography>
                            </Box>
                            <Divider />
                            <Box sx={{ p: 2.5 }}>
                                <Grid container spacing={2} direction="column">
                                    <Grid item>
                                        <Box
                                            sx={{
                                                p: 0,
                                                borderRadius: 2,
                                                border: `1px solid ${theme.palette.divider}`,
                                                position: 'relative',
                                                overflow: 'hidden',
                                                transition: 'transform 100ms cubic-bezier(0.2,0,0,1)',
                                                '&:hover': { transform: 'translateY(-2px)' },
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
                                                    p: 2,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        inset: 0,
                                                        bgcolor: subtle(theme.palette.primary.main, 0.08),
                                                        opacity: 0.6,
                                                    }}
                                                />
                                                <Typography
                                                    fontWeight={700}
                                                    gutterBottom
                                                    sx={{ position: 'relative', color: 'primary.main', letterSpacing: '-0.01em' }}
                                                >
                                                    Find a Game
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ position: 'relative' }}>
                                                    Join the queue to play
                                                </Typography>
                                            </Link>
                                        </Box>
                                    </Grid>

                                    <Grid item>
                                        <Box
                                            sx={{
                                                p: 0,
                                                borderRadius: 2,
                                                border: `1px solid ${theme.palette.divider}`,
                                                position: 'relative',
                                                overflow: 'hidden',
                                                transition: 'transform 100ms cubic-bezier(0.2,0,0,1)',
                                                '&:hover': { transform: 'translateY(-2px)' },
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
                                                    p: 2,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        inset: 0,
                                                        bgcolor: subtle(theme.palette.primary.main, 0.08),
                                                        opacity: 0.6,
                                                    }}
                                                />
                                                <Typography
                                                    fontWeight={700}
                                                    gutterBottom
                                                    sx={{ position: 'relative', color: 'primary.main', letterSpacing: '-0.01em' }}
                                                >
                                                    Your Profile
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ position: 'relative' }}>
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
