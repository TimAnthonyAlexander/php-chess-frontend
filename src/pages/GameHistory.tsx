import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { userService } from '../services/api';
import type { Game } from '../types';
import { useAuth } from '../hooks/useAuth';
import {
    Box,
    Button,
    ButtonGroup,
    Chip,
    CircularProgress,
    Container,
    Link,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Alert,
    useTheme,
    alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Styled components
const FilterButton = styled(Button)(({ theme }) => ({
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(theme.palette.secondary.main, 0.8)})`,
        opacity: 0,
        transition: 'opacity 0.3s ease'
    },
    '&.active': {
        color: '#fff',
        '&::before': {
            opacity: 1
        }
    },
    '& .MuiButton-label': {
        position: 'relative',
        zIndex: 1
    }
}));

const ColorDot = styled('span')(({ color }: { color: 'white' | 'black' }) => ({
    display: 'inline-block',
    width: 12,
    height: 12,
    borderRadius: '50%',
    marginRight: 8,
    backgroundColor: color === 'white' ? '#f5f5f5' : '#111',
    border: color === 'white' ? '1px solid #ddd' : 'none',
    boxShadow: `0 2px 4px ${color === 'white' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.3)'}`
}));

const GameHistory = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTimeClass, setSelectedTimeClass] = useState<string | null>(null);
    const { user } = useAuth();
    const theme = useTheme();

    useEffect(() => {
        const fetchGames = async () => {
            setIsLoading(true);
            try {
                const response = await userService.getRecentGames(selectedTimeClass || undefined);
                setGames(response);
            } catch (err) {
                setError('Failed to load game history');
                console.error('Error loading games:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGames();
    }, [selectedTimeClass]);

    const formatResult = (game: Game): string => {
        if (!game.result) return 'In Progress';

        const isWhite = user?.id === game.white_id;

        if (game.result === '1-0') {
            return isWhite ? 'Win' : 'Loss';
        } else if (game.result === '0-1') {
            return isWhite ? 'Loss' : 'Win';
        } else {
            return 'Draw';
        }
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatTime = (dateString: string): string => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getResultColor = (result: string): 'success' | 'error' | 'default' => {
        if (result === 'Win') return 'success';
        if (result === 'Loss') return 'error';
        return 'default';
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h3" sx={{ 
                mb: 4, 
                fontWeight: 700,
                position: 'relative',
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-8px',
                    left: 0,
                    width: '80px',
                    height: '4px',
                    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.light})`,
                    borderRadius: '2px'
                }
            }}>
                Game History
            </Typography>

            {/* Time class filter */}
            <Box sx={{ mb: 5 }}>
                <ButtonGroup 
                    variant="outlined" 
                    size="medium"
                    sx={{ 
                        '& .MuiButton-root': {
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                            px: 3,
                            py: 1,
                            transition: 'all 0.3s ease',
                        }
                    }}
                >
                    <FilterButton
                        className={selectedTimeClass === null ? 'active' : ''}
                        onClick={() => setSelectedTimeClass(null)}
                        sx={{
                            fontWeight: selectedTimeClass === null ? 600 : 400,
                        }}
                    >
                        All
                    </FilterButton>
                    <FilterButton
                        className={selectedTimeClass === 'bullet' ? 'active' : ''}
                        onClick={() => setSelectedTimeClass('bullet')}
                        sx={{
                            fontWeight: selectedTimeClass === 'bullet' ? 600 : 400,
                        }}
                    >
                        Bullet
                    </FilterButton>
                    <FilterButton
                        className={selectedTimeClass === 'blitz' ? 'active' : ''}
                        onClick={() => setSelectedTimeClass('blitz')}
                        sx={{
                            fontWeight: selectedTimeClass === 'blitz' ? 600 : 400,
                        }}
                    >
                        Blitz
                    </FilterButton>
                    <FilterButton
                        className={selectedTimeClass === 'rapid' ? 'active' : ''}
                        onClick={() => setSelectedTimeClass('rapid')}
                        sx={{
                            fontWeight: selectedTimeClass === 'rapid' ? 600 : 400,
                        }}
                    >
                        Rapid
                    </FilterButton>
                </ButtonGroup>
            </Box>

            {/* Games table */}
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
                    <CircularProgress 
                        size={60}
                        sx={{ color: theme => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` }}
                    />
                </Box>
            ) : games.length > 0 ? (
                <TableContainer 
                    component={Paper} 
                    elevation={2}
                    sx={{ 
                        borderRadius: '12px',
                        overflow: 'hidden',
                        mb: 4
                    }}
                >
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.light, 0.04) }}>
                            <TableRow>
                                <TableCell sx={{ 
                                    fontSize: '0.75rem', 
                                    fontWeight: 600, 
                                    letterSpacing: '0.05em',
                                    color: 'text.secondary',
                                    textTransform: 'uppercase',
                                }}>
                                    Date
                                </TableCell>
                                <TableCell sx={{ 
                                    fontSize: '0.75rem', 
                                    fontWeight: 600, 
                                    letterSpacing: '0.05em',
                                    color: 'text.secondary',
                                    textTransform: 'uppercase',
                                }}>
                                    Time
                                </TableCell>
                                <TableCell sx={{ 
                                    fontSize: '0.75rem', 
                                    fontWeight: 600, 
                                    letterSpacing: '0.05em',
                                    color: 'text.secondary',
                                    textTransform: 'uppercase',
                                }}>
                                    Opponent
                                </TableCell>
                                <TableCell sx={{ 
                                    fontSize: '0.75rem', 
                                    fontWeight: 600, 
                                    letterSpacing: '0.05em',
                                    color: 'text.secondary',
                                    textTransform: 'uppercase',
                                }}>
                                    Color
                                </TableCell>
                                <TableCell sx={{ 
                                    fontSize: '0.75rem', 
                                    fontWeight: 600, 
                                    letterSpacing: '0.05em',
                                    color: 'text.secondary',
                                    textTransform: 'uppercase',
                                }}>
                                    Time Control
                                </TableCell>
                                <TableCell sx={{ 
                                    fontSize: '0.75rem', 
                                    fontWeight: 600, 
                                    letterSpacing: '0.05em',
                                    color: 'text.secondary',
                                    textTransform: 'uppercase',
                                }}>
                                    Result
                                </TableCell>
                                <TableCell sx={{ 
                                    fontSize: '0.75rem', 
                                    fontWeight: 600, 
                                    letterSpacing: '0.05em',
                                    color: 'text.secondary',
                                    textTransform: 'uppercase',
                                }}>
                                    Termination
                                </TableCell>
                                <TableCell sx={{ 
                                    fontSize: '0.75rem', 
                                    fontWeight: 600, 
                                    letterSpacing: '0.05em',
                                    color: 'text.secondary',
                                    textTransform: 'uppercase',
                                }}>
                                    Action
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {games.map((game, index) => {
                                const isWhite = user?.id === game.white_id;
                                const opponent = isWhite ? game.black : game.white;
                                const result = formatResult(game);
                                const resultColor = getResultColor(result);
                                
                                return (
                                    <TableRow 
                                        key={game.id}
                                        sx={{ 
                                            transition: 'background-color 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: alpha(theme.palette.primary.light, 0.04)
                                            },
                                            '&:nth-of-type(odd)': {
                                                backgroundColor: alpha(theme.palette.background.default, 0.4),
                                            }
                                        }}
                                    >
                                        <TableCell sx={{ 
                                            py: 2.5, 
                                            fontSize: '0.875rem', 
                                            color: theme.palette.text.secondary 
                                        }}>
                                            {formatDate(game.created_at)}
                                        </TableCell>
                                        <TableCell sx={{ 
                                            py: 2.5, 
                                            fontSize: '0.875rem', 
                                            color: theme.palette.text.secondary 
                                        }}>
                                            {formatTime(game.created_at)}
                                        </TableCell>
                                        <TableCell sx={{ 
                                            py: 2.5, 
                                            fontSize: '0.875rem',
                                            fontWeight: 500
                                        }}>
                                            {opponent?.name || 'Unknown'}
                                        </TableCell>
                                        <TableCell sx={{ py: 2.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <ColorDot color={isWhite ? 'white' : 'black'} />
                                                <Typography variant="body2">
                                                    {isWhite ? 'White' : 'Black'}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ 
                                            py: 2.5, 
                                            fontSize: '0.875rem', 
                                            color: theme.palette.text.secondary 
                                        }}>
                                            {game.timeControl?.name || 'Standard'}
                                        </TableCell>
                                        <TableCell sx={{ py: 2.5 }}>
                                            <Chip
                                                label={result}
                                                color={resultColor}
                                                size="small"
                                                variant="outlined"
                                                sx={{ 
                                                    fontWeight: 600,
                                                    minWidth: 60,
                                                    '& .MuiChip-label': {
                                                        px: 1
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ 
                                            py: 2.5, 
                                            fontSize: '0.875rem', 
                                            color: theme.palette.text.secondary,
                                            textTransform: 'capitalize'
                                        }}>
                                            {game.reason || 'N/A'}
                                        </TableCell>
                                        <TableCell sx={{ py: 2.5 }}>
                                            <Link
                                                component={RouterLink}
                                                to={`/game/${game.id}`}
                                                underline="hover"
                                                sx={{ 
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    color: theme.palette.primary.main,
                                                    fontWeight: 500,
                                                    fontSize: '0.875rem',
                                                    transition: 'color 0.2s ease',
                                                    '&:hover': {
                                                        color: theme.palette.primary.dark
                                                    }
                                                }}
                                            >
                                                <VisibilityIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                                                View
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Paper 
                    elevation={2} 
                    sx={{ 
                        textAlign: 'center', 
                        py: 8, 
                        px: 4, 
                        borderRadius: '12px',
                        background: `linear-gradient(to bottom, ${theme.palette.background.paper}, ${alpha(theme.palette.background.default, 0.8)})`
                    }}
                >
                    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                        No games found.
                    </Typography>
                    <Button
                        component={RouterLink}
                        to="/play"
                        variant="contained"
                        sx={{ 
                            px: 4,
                            py: 1.2,
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.25)}`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                            }
                        }}
                    >
                        Play a Game
                    </Button>
                </Paper>
            )}

            {/* Error message */}
            {error && (
                <Alert 
                    severity="error" 
                    sx={{ 
                        mt: 4, 
                        borderRadius: 2,
                        '& .MuiAlert-message': {
                            fontWeight: 500
                        }
                    }}
                >
                    {error}
                </Alert>
            )}
        </Container>
    );
};

export default GameHistory;
