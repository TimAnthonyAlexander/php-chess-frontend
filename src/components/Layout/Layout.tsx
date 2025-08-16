import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { styled } from '@mui/material/styles';
import NavBar from './NavBar';
import Footer from './Footer';

interface LayoutProps {
    children: React.ReactNode;
}

const MainContent = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(4, 0),
}));

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const { isAuthenticated, logout } = useAuth();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                bgcolor: 'background.default',
            }}
        >
            <NavBar />

            <MainContent component="main">
                <Container maxWidth="lg">
                    {children}
                </Container>
            </MainContent>

            <Footer />
        </Box>
    );
};

export default Layout;
