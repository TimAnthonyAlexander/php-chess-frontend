import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import type { PlayerRating } from '../types';
import { useAuth } from '../hooks/useAuth';
import {
    Box,
    Card,
    CircularProgress,
    Container,
    Divider,
    Grid,
    Avatar,
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

// Styled components
const RatingCard = styled(Card)(({ theme }) => ({
    padding: theme.spacing(3),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
        '&::after': {
            opacity: 0.7,
            transform: 'translate(-30%, -30%) scale(1.2)'
        }
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.2)}, transparent 70%)`,
        top: '50%',
        right: '0%',
        opacity: 0.3,
        transform: 'translate(50%, -50%)',
        transition: 'all 0.5s ease',
        zIndex: 0
    }
}));

const GradientTypography = styled(Typography)(({ theme }) => ({
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 800
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: 80,
    height: 80,
    fontSize: '2rem',
    fontWeight: 700,
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.25)}`
}));

const Profile = () => {
    const [ratings, setRatings] = useState<PlayerRating[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const theme = useTheme();

    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const response = await userService.getRatings();
                setRatings(response);
            } catch (err) {
                setError('Failed to load ratings');
                console.error('Error loading ratings:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRatings();
    }, []);

    // Helper to get rating for specific time class
    const getRating = (timeClass: string): number => {
        const rating = ratings.find(r => r.time_class === timeClass);
        return rating?.rating || 1500;
    };

    // Helper to get games played for specific time class
    const getGamesPlayed = (timeClass: string): number => {
        const rating = ratings.find(r => r.time_class === timeClass);
        return rating?.games || 0;
    };

    return (
        <Container maxWidth="lg" sx={{ py: 5 }}>
            <Typography variant="h3" component="h1" sx={{ mb: 4, fontWeight: 700, position: 'relative' }}>
                Your <GradientTypography component="span">Profile</GradientTypography>
            </Typography>

            {/* Profile info */}
            <Card 
                elevation={2} 
                sx={{ 
                    mb: 5, 
                    p: 3,
                    background: `linear-gradient(to right, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 1)})`
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <StyledAvatar>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </StyledAvatar>
                    <Box sx={{ ml: 3 }}>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                            {user?.name || 'User'}
                        </Typography>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                color: 'text.secondary',
                                fontWeight: 500
                            }}
                        >
                            {user?.email || ''}
                        </Typography>
                    </Box>
                </Box>
            </Card>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress 
                        size={60}
                        sx={{
                            color: theme => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        }} 
                    />
                </Box>
            ) : (
                <>
                    {/* Rating overview */}
                    <Box sx={{ mb: 2 }}>
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                mb: 3, 
                                fontWeight: 600,
                                position: 'relative',
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: '-8px',
                                    left: 0,
                                    width: '60px',
                                    height: '3px',
                                    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.light})`,
                                    borderRadius: '3px'
                                }
                            }}
                        >
                            Ratings
                        </Typography>
                    </Box>
                    
                    <Grid container spacing={3} sx={{ mb: 6 }}>
                        {/* Bullet */}
                        <Grid item xs={12} md={4}>
                            <RatingCard elevation={2}>
                                <Typography 
                                    variant="subtitle2" 
                                    sx={{ 
                                        color: 'text.secondary', 
                                        mb: 0.5,
                                        letterSpacing: '0.05em',
                                        textTransform: 'uppercase',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Bullet
                                </Typography>
                                <Typography 
                                    variant="h3" 
                                    sx={{ 
                                        fontWeight: 700,
                                        mb: 1,
                                        position: 'relative',
                                        zIndex: 1
                                    }}
                                >
                                    {getRating('bullet')}
                                </Typography>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        color: 'text.secondary',
                                        fontWeight: 500,
                                        position: 'relative',
                                        zIndex: 1
                                    }}
                                >
                                    {getGamesPlayed('bullet')} games played
                                </Typography>
                            </RatingCard>
                        </Grid>

                        {/* Blitz */}
                        <Grid item xs={12} md={4}>
                            <RatingCard elevation={2}>
                                <Typography 
                                    variant="subtitle2" 
                                    sx={{ 
                                        color: 'text.secondary', 
                                        mb: 0.5,
                                        letterSpacing: '0.05em',
                                        textTransform: 'uppercase',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Blitz
                                </Typography>
                                <Typography 
                                    variant="h3" 
                                    sx={{ 
                                        fontWeight: 700,
                                        mb: 1,
                                        position: 'relative',
                                        zIndex: 1
                                    }}
                                >
                                    {getRating('blitz')}
                                </Typography>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        color: 'text.secondary',
                                        fontWeight: 500,
                                        position: 'relative',
                                        zIndex: 1
                                    }}
                                >
                                    {getGamesPlayed('blitz')} games played
                                </Typography>
                            </RatingCard>
                        </Grid>

                        {/* Rapid */}
                        <Grid item xs={12} md={4}>
                            <RatingCard elevation={2}>
                                <Typography 
                                    variant="subtitle2" 
                                    sx={{ 
                                        color: 'text.secondary', 
                                        mb: 0.5,
                                        letterSpacing: '0.05em',
                                        textTransform: 'uppercase',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Rapid
                                </Typography>
                                <Typography 
                                    variant="h3" 
                                    sx={{ 
                                        fontWeight: 700,
                                        mb: 1,
                                        position: 'relative',
                                        zIndex: 1
                                    }}
                                >
                                    {getRating('rapid')}
                                </Typography>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        color: 'text.secondary',
                                        fontWeight: 500,
                                        position: 'relative',
                                        zIndex: 1
                                    }}
                                >
                                    {getGamesPlayed('rapid')} games played
                                </Typography>
                            </RatingCard>
                        </Grid>
                    </Grid>

                    {/* Detailed ratings */}
                    <Box sx={{ mb: 2 }}>
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                mb: 3, 
                                fontWeight: 600,
                                position: 'relative',
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: '-8px',
                                    left: 0,
                                    width: '60px',
                                    height: '3px',
                                    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.light})`,
                                    borderRadius: '3px'
                                }
                            }}
                        >
                            Rating Details
                        </Typography>
                    </Box>
                    
                    <TableContainer 
                        component={Paper} 
                        elevation={2} 
                        sx={{ 
                            overflow: 'hidden',
                            borderRadius: '12px',
                            '& .MuiTableRow-root:last-child .MuiTableCell-root': {
                                borderBottom: 'none'
                            }
                        }}
                    >
                        <Table>
                            <TableHead>
                                <TableRow sx={{ 
                                    background: alpha(theme.palette.primary.light, 0.04),
                                    borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                                }}>
                                    <TableCell sx={{ 
                                        fontSize: '0.75rem', 
                                        fontWeight: 600, 
                                        letterSpacing: '0.05em',
                                        color: 'text.secondary',
                                        textTransform: 'uppercase',
                                        py: 2
                                    }}>
                                        Time Class
                                    </TableCell>
                                    <TableCell sx={{ 
                                        fontSize: '0.75rem', 
                                        fontWeight: 600, 
                                        letterSpacing: '0.05em',
                                        color: 'text.secondary',
                                        textTransform: 'uppercase',
                                        py: 2
                                    }}>
                                        Rating
                                    </TableCell>
                                    <TableCell sx={{ 
                                        fontSize: '0.75rem', 
                                        fontWeight: 600, 
                                        letterSpacing: '0.05em',
                                        color: 'text.secondary',
                                        textTransform: 'uppercase',
                                        py: 2
                                    }}>
                                        Games Played
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {ratings.length > 0 ? (
                                    ratings.map((rating, index) => (
                                        <TableRow 
                                            key={rating.id} 
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
                                                fontSize: '0.95rem',
                                                fontWeight: 500,
                                                textTransform: 'capitalize',
                                                borderBottom: index === ratings.length - 1 ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.8)}`
                                            }}>
                                                {rating.time_class}
                                            </TableCell>
                                            <TableCell sx={{ 
                                                py: 2.5,
                                                fontSize: '0.95rem',
                                                fontWeight: 600,
                                                borderBottom: index === ratings.length - 1 ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.8)}`
                                            }}>
                                                {rating.rating}
                                            </TableCell>
                                            <TableCell sx={{ 
                                                py: 2.5,
                                                fontSize: '0.95rem',
                                                color: 'text.secondary',
                                                borderBottom: index === ratings.length - 1 ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.8)}`
                                            }}>
                                                {rating.games}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell 
                                            colSpan={3} 
                                            align="center" 
                                            sx={{ 
                                                py: 4, 
                                                color: 'text.secondary',
                                                fontSize: '0.95rem',
                                                fontStyle: 'italic'
                                            }}
                                        >
                                            No ratings data available. Play some games to get started!
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
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

export default Profile;
