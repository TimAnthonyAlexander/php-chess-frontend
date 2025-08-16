import { Box, Container, Typography, Link, Stack, Divider, useTheme, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';

const FooterLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  textDecoration: 'none',
  position: 'relative',
  transition: 'all 0.3s ease',
  '&:hover': {
    color: theme.palette.primary.main,
    '&::after': {
      width: '100%',
      opacity: 1
    }
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '0%',
    height: '1px',
    bottom: '-2px',
    left: '0',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.light})`,
    transition: 'width 0.3s ease, opacity 0.3s ease',
    opacity: 0
  }
}));

const Footer = () => {
  const theme = useTheme();
  
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 2,
        mt: 'auto',
        backgroundColor: alpha(theme.palette.background.paper, 0.9),
        borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        backdropFilter: 'blur(8px)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          right: '5%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.07)}, transparent 70%)`,
          zIndex: 0,
        }
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              mb: { xs: 2, md: 0 },
              background: `linear-gradient(45deg, ${theme.palette.text.primary}, ${alpha(theme.palette.text.secondary, 0.7)})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.01em',
              fontWeight: 500
            }}
          >
            &copy; {new Date().getFullYear()} Chess App. All rights reserved.
          </Typography>
          
          <Stack 
            direction="row" 
            spacing={3}
            divider={
              <Divider 
                orientation="vertical" 
                flexItem 
                sx={{ 
                  background: `linear-gradient(to bottom, transparent, ${alpha(theme.palette.primary.light, 0.3)}, transparent)`,
                  width: '1px'
                }} 
              />}
          >
            <FooterLink href="#">
              Terms of Service
            </FooterLink>
            <FooterLink href="#">
              Privacy Policy
            </FooterLink>
            <FooterLink href="#">
              Contact
            </FooterLink>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
