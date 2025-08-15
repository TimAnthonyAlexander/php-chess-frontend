import { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const NavBar = () => {
  const theme = useTheme();
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

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
                bgcolor: isActive(item.path) ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                borderLeft: isActive(item.path) ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
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
                color: theme.palette.error.main
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
                bgcolor: theme.palette.primary.main,
                color: '#fff',
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
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
      <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                textDecoration: 'none',
              }}
            >
              Chess App
            </Typography>
            
            {/* Desktop menu */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              {navItems.map((item) => (
                <Button
                  key={item.title}
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    mx: 1,
                    color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                    fontWeight: isActive(item.path) ? 'medium' : 'regular',
                    borderBottom: isActive(item.path) ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                    borderRadius: 0,
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: 'primary.main',
                    },
                  }}
                >
                  {item.title}
                </Button>
              ))}
              
              {isAuthenticated && (
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={logout}
                  sx={{ ml: 2 }}
                >
                  Logout
                </Button>
              )}
              
              {!isAuthenticated && (
                <Button
                  variant="contained"
                  color="primary"
                  component={RouterLink}
                  to="/register"
                  sx={{ ml: 2 }}
                >
                  Sign Up
                </Button>
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
