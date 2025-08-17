import { useState } from 'react';
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

const NavLink = styled(Button)(({ theme }) => ({
    position: 'relative',
    paddingInline: theme.spacing(1.25),
    borderRadius: 0,
    textTransform: 'none',
    fontWeight: 600,
    '&::after': {
        content: '""',
        position: 'absolute',
        left: '10%',
        right: '10%',
        bottom: -6,
        height: 2,
        borderRadius: 1,
        background: alpha(theme.palette.primary.main, 0.9),
        transform: 'scaleX(0)',
        transformOrigin: 'center',
        transition: 'transform 120ms cubic-bezier(0.2,0,0,1)',
    },
    '&:hover': {
        backgroundColor: 'transparent',
        color: theme.palette.primary.main,
    },
    '&.active::after': {
        transform: 'scaleX(1)',
    },
}));

function NavBar() {
    const theme = useTheme();
    const location = useLocation();
    const { isAuthenticated, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const scrollTrigger = useScrollTrigger({ disableHysteresis: true, threshold: 12 });

    const isActive = (path: string) => location.pathname === path;

    const navItems = isAuthenticated
        ? [
            { title: 'Home', path: '/' },
            { title: 'Play', path: '/play' },
            { title: 'History', path: '/history' },
            { title: 'Profile', path: '/profile' },
        ]
        : [{ title: 'Login', path: '/login' }];

    const handleDrawerToggle = () => setMobileOpen((v) => !v);

    const drawer = (
        <Box sx={{ textAlign: 'center' }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>
                    DarkSquare
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
                            onClick={() => setMobileOpen(false)}
                            sx={{
                                textAlign: 'left',
                                px: 2,
                                py: 1.25,
                                borderLeft: isActive(item.path) ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                                bgcolor: isActive(item.path) ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                            }}
                        >
                            <ListItemText
                                primary={item.title}
                                primaryTypographyProps={{
                                    fontWeight: isActive(item.path) ? 700 : 500,
                                    color: isActive(item.path) ? theme.palette.primary.main : theme.palette.text.primary,
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}

                {isAuthenticated ? (
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={() => {
                                setMobileOpen(false);
                                logout();
                            }}
                            sx={{
                                textAlign: 'left',
                                px: 2,
                                py: 1.25,
                                color: theme.palette.error.main,
                                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) },
                            }}
                        >
                            <ListItemText primary="Logout" />
                        </ListItemButton>
                    </ListItem>
                ) : (
                    <ListItem disablePadding>
                        <ListItemButton
                            component={RouterLink}
                            to="/register"
                            onClick={() => setMobileOpen(false)}
                            sx={{
                                textAlign: 'left',
                                px: 2,
                                py: 1.25,
                                bgcolor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                                borderRadius: 1,
                                m: 1.5,
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.85) },
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
                elevation={0}
                color="default"
                sx={{
                    bgcolor: 'background.paper',
                    borderBottom: `1px solid ${scrollTrigger ? alpha(theme.palette.common.white, 0.16) : theme.palette.divider
                        }`,
                }}
            >
                <Container maxWidth="lg">
                    <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64 }}>
                        <Typography
                            variant="h6"
                            component={RouterLink}
                            to="/"
                            style={{ textDecoration: 'none' }}
                            sx={{
                                fontWeight: 800,
                                letterSpacing: '-0.01em',
                                color: 'primary.main',
                            }}
                        >
                            DarkSquare
                        </Typography>

                        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.title}
                                    component={RouterLink}
                                    to={item.path}
                                    className={isActive(item.path) ? 'active' : ''}
                                    sx={{
                                        color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                                    }}
                                >
                                    {item.title}
                                </NavLink>
                            ))}

                            {isAuthenticated ? (
                                <Button
                                    variant="outlined"
                                    onClick={logout}
                                    sx={{
                                        ml: 2,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        borderRadius: 2,
                                        borderColor: alpha(theme.palette.text.primary, 0.24),
                                        color: theme.palette.text.primary,
                                        '&:hover': {
                                            borderColor: alpha(theme.palette.text.primary, 0.48),
                                            bgcolor: alpha(theme.palette.text.primary, 0.04),
                                        },
                                    }}
                                >
                                    Logout
                                </Button>
                            ) : (
                                <Button
                                    component={RouterLink}
                                    to="/register"
                                    variant="contained"
                                    color="primary"
                                    sx={{
                                        ml: 2,
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        borderRadius: 2,
                                        boxShadow: 'none',
                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.85) },
                                    }}
                                >
                                    Sign Up
                                </Button>
                            )}
                        </Box>

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

            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: '80%',
                        boxSizing: 'border-box',
                        bgcolor: 'background.paper',
                        borderLeft: `1px solid ${theme.palette.divider}`,
                        borderRadius: 0,
                    },
                }}
            >
                {drawer}
            </Drawer>
        </>
    );
}

export default NavBar;
