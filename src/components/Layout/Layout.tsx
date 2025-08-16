import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { styled, alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material';
import NavBar from './NavBar';
import Footer from './Footer';

interface LayoutProps {
    children: React.ReactNode;
}

const MainContent = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(4, 0),
    position: 'relative',
    overflow: 'hidden',
    zIndex: 0,
    '&::before': {
        content: '""',
        position: 'absolute',
        top: '30%',
        right: '-15%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(theme.palette.secondary.light, 0.08)}, transparent 70%)`,
        zIndex: -1,
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        bottom: '10%',
        left: '-10%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.06)}, transparent 70%)`,
        zIndex: -1,
    }
}));

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const { isAuthenticated, logout } = useAuth();
    const theme = useTheme();
    const [scrollPosition, setScrollPosition] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollPosition(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                bgcolor: 'background.default',
                backgroundImage: `linear-gradient(180deg, 
                    ${alpha(theme.palette.background.default, 1)} 0%, 
                    ${alpha(theme.palette.background.default, 0.98)} 70%, 
                    ${alpha(theme.palette.primary.light, 0.03)} 100%)`,
                transition: 'background 0.5s ease',
            }}
        >
            <NavBar />

            <MainContent component="main">
                <Container maxWidth="xl">
                    {children}
                </Container>
            </MainContent>

            <Footer />
        </Box>
    );
};

export default Layout;
