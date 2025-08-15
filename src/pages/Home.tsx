import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { userService, leaderboardService } from '../services/api';
import type { Game, PlayerRating } from '../types';
import { useAuth } from '../contexts/AuthContext';
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
    Grid,
    Link,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const Home = () => {
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
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h5" component="h1" fontWeight="bold">
                                        Welcome, {user?.name}!
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handlePlayNow}
                                        startIcon={<PlayArrowIcon />}
                                    >
                                        {activeGameId ? 'Resume Game' : 'Play Now'}
                                    </Button>
                                </Box>

                                {activeGameId && (
                                    <Paper
                                        sx={{
                                            p: 2,
                                            bgcolor: 'action.hover',
                                            borderRadius: 1,
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
                                    </Paper>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Recent Games */}
                    <Grid item>
                        <Card>
                            <CardHeader
                                title="Recent Games"
                                action={
                                    <Button
                                        component={RouterLink}
                                        to="/history"
                                        color="primary"
                                        size="small"
                                        endIcon={<ArrowForwardIcon />}
                                    >
                                        View all
                                    </Button>
                                }
                                titleTypographyProps={{ variant: 'h6' }}
                            />
                            <Divider />
                            <CardContent sx={{ pt: 2, px: 0, pb: 0 }}>
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
                                                            <TableCell sx={{ fontWeight: 'medium' }}>
                                                                {opponent?.name || 'Unknown'}
                                                            </TableCell>
                                                            <TableCell>{game.timeControl?.name || ''}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={result.text}
                                                                    color={result.color as 'default' | 'success' | 'error'}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Button
                                                                    component={RouterLink}
                                                                    to={`/game/${game.id}`}
                                                                    color="primary"
                                                                    size="small"
                                                                    startIcon={<VisibilityIcon />}
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
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Grid>

            {/* Sidebar - Right Side */}
            <Grid item xs={12} lg={4}>
                <Grid container spacing={3} direction="column">
                    {/* Leaderboard */}
                    <Grid item>
                        <Card>
                            <CardHeader
                                title="Leaderboard"
                                titleTypographyProps={{ variant: 'h6' }}
                            />
                            <Divider />
                            <CardContent sx={{ pt: 2 }}>
                                <ButtonGroup
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    sx={{ mb: 3 }}
                                >
                                    <Button
                                        onClick={() => handleTimeClassChange('bullet')}
                                        color={selectedTimeClass === 'bullet' ? 'primary' : 'inherit'}
                                        variant={selectedTimeClass === 'bullet' ? 'contained' : 'outlined'}
                                    >
                                        Bullet
                                    </Button>
                                    <Button
                                        onClick={() => handleTimeClassChange('blitz')}
                                        color={selectedTimeClass === 'blitz' ? 'primary' : 'inherit'}
                                        variant={selectedTimeClass === 'blitz' ? 'contained' : 'outlined'}
                                    >
                                        Blitz
                                    </Button>
                                    <Button
                                        onClick={() => handleTimeClassChange('rapid')}
                                        color={selectedTimeClass === 'rapid' ? 'primary' : 'inherit'}
                                        variant={selectedTimeClass === 'rapid' ? 'contained' : 'outlined'}
                                    >
                                        Rapid
                                    </Button>
                                </ButtonGroup>

                                {leaderboard.length === 0 ? (
                                    <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                                        No leaderboard data available.
                                    </Typography>
                                ) : (
                                    <TableContainer component={Paper} variant="outlined">
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
                                                            bgcolor: user?.id === entry.user_id ? 'warning.light' : 'inherit',
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
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Quick Links */}
                    <Grid item>
                        <Card>
                            <CardHeader
                                title="Quick Links"
                                titleTypographyProps={{ variant: 'h6' }}
                            />
                            <Divider />
                            <CardContent>
                                <Grid container spacing={2} direction="column">
                                    <Grid item>
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                '&:hover': {
                                                    bgcolor: 'action.hover',
                                                },
                                            }}
                                        >
                                            <Link
                                                component={RouterLink}
                                                to="/play"
                                                color="inherit"
                                                underline="none"
                                            >
                                                <Typography fontWeight="medium" gutterBottom>Find a Game</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Join the queue to play
                                                </Typography>
                                            </Link>
                                        </Paper>
                                    </Grid>

                                    <Grid item>
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                '&:hover': {
                                                    bgcolor: 'action.hover',
                                                },
                                            }}
                                        >
                                            <Link
                                                component={RouterLink}
                                                to="/profile"
                                                color="inherit"
                                                underline="none"
                                            >
                                                <Typography fontWeight="medium" gutterBottom>Your Profile</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    View your stats and ratings
                                                </Typography>
                                            </Link>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default Home;
