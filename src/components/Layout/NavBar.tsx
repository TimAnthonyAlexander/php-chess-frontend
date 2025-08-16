import { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
    AppBar,
    Box,
    Button,
    Container,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Toolbar,
    Typography,
    useTheme,
    alpha,
    useScrollTrigger
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

// Styled components
const GradientButton = styled(Button)(({ theme }) => ({
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.light})`,
    color: '#fff',
    transition: 'all 0.3s ease',
    '&:hover': {
        boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
        transform: 'translateY(-2px)'
    }
}));

const AnimatedNavLink = styled(Button)(({ theme }) => ({
    position: 'relative',
    overflow: 'hidden',
    '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: '50%',
        width: 0,
        height: 2,
        background: `linear-gradient(90deg, ${theme.palette.secondary.light}, ${theme.palette.primary.main})`,
        transition: 'all 0.3s ease',
        transform: 'translateX(-50%)'
    },
    '&:hover::after': {
        width: '80%'
    }
}));

const NavBar = () => {
    const theme = useTheme();
    const location = useLocation();
    const { isAuthenticated, logout, user } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const scrollTrigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 100
    });

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    const navItems = isAuthenticated
        ? [
            { title: 'Home', path: '/' },
            { title: 'Play', path: '/play' },
            { title: 'History', path: '/history' },
            { title: 'Profile', path: '/profile' }
        ]
        : [
            { title: 'Login', path: '/login' }
        ];

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1,
                borderBottom: `1px solid ${theme.palette.divider}`
            }}>
                <Typography variant="h6" sx={{ my: 2 }}>
                    Chess App
                </Typography>
                <IconButton color="inherit" onClick={handleDrawerToggle}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <List>
                {navItems.map((item) => (
                    <ListItem key={item.title} disablePadding>
                        <ListItemButton
                            component={RouterLink}
                            to={item.path}
                            sx={{
                                textAlign: 'center',
                                position: 'relative',
                                bgcolor: isActive(item.path) ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                borderLeft: isActive(item.path)
                                    ? `4px solid ${theme.palette.primary.main}`
                                    : '4px solid transparent',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.light, 0.08),
                                }
                            }}
                        >
                            <ListItemText
                                primary={item.title}
                                primaryTypographyProps={{
                                    color: isActive(item.path) ? 'primary' : 'inherit',
                                    fontWeight: isActive(item.path) ? 'medium' : 'regular'
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}

                {isAuthenticated && (
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={logout}
                            sx={{
                                textAlign: 'center',
                                color: theme.palette.secondary.main,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    bgcolor: alpha(theme.palette.secondary.main, 0.08),
                                }
                            }}
                        >
                            <ListItemText primary="Logout" />
                        </ListItemButton>
                    </ListItem>
                )}

                {!isAuthenticated && (
                    <ListItem disablePadding>
                        <ListItemButton
                            component={RouterLink}
                            to="/register"
                            sx={{
                                textAlign: 'center',
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.light})`,
                                color: '#fff',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    filter: 'brightness(1.1)',
                                }
                            }}
                        >
                            <ListItemText primary="Sign Up" />
                        </ListItemButton>
                    </ListItem>
                )}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar
                position="sticky"
                color="default"
                elevation={scrollTrigger ? 4 : 0}
                sx={{
                    bgcolor: 'background.paper',
                    backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.95), rgba(255,255,255,0.98))',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.3s ease'
                }}>

                <Container maxWidth="lg">
                    <Toolbar sx={{ justifyContent: 'space-between' }}>
                        <Typography
                            variant="h6"
                            component={RouterLink}
                            to="/"
                            sx={{
                                fontWeight: 800,
                                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.main})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '0.02em',
                                textDecoration: 'none',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'scale(1.03)',
                                }
                            }}
                        >
                            Chess App
                        </Typography>

                        {/* Desktop menu */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                            {navItems.map((item) => (
                                <AnimatedNavLink
                                    key={item.title}
                                    component={RouterLink}
                                    to={item.path}
                                    sx={{
                                        mx: 1,
                                        color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                                        fontWeight: isActive(item.path) ? 500 : 400,
                                        borderRadius: 0,
                                        '&:hover': {
                                            backgroundColor: 'transparent',
                                            color: 'primary.main',
                                        },
                                        '&::after': isActive(item.path) ? {
                                            width: '80%',
                                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.light})`,
                                        } : {}
                                    }}
                                >
                                    {item.title}
                                </AnimatedNavLink>
                            ))}

                            {isAuthenticated && (
                                <Button
                                    variant="outlined"
                                    onClick={logout}
                                    sx={{
                                        ml: 2,
                                        borderColor: alpha(theme.palette.secondary.main, 0.5),
                                        color: theme.palette.secondary.main,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            borderColor: theme.palette.secondary.main,
                                            backgroundColor: alpha(theme.palette.secondary.main, 0.04),
                                        }
                                    }}
                                >
                                    Logout
                                </Button>
                            )}

                            {!isAuthenticated && (
                                <GradientButton
                                    component={RouterLink}
                                    to="/register"
                                    sx={{ ml: 2 }}
                                >
                                    Sign Up
                                </GradientButton>
                            )}
                        </Box>

                        {/* Mobile menu button */}
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="end"
                            onClick={handleDrawerToggle}
                            sx={{ display: { md: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Mobile drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { width: '80%', boxSizing: 'border-box' },
                }}
            >
                {drawer}
            </Drawer>
        </>
    );
};

export default NavBar;
