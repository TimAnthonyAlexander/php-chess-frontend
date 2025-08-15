import { Box, Container, Typography, Link, Stack, Divider, useTheme } from '@mui/material';

const Footer = () => {
  const theme = useTheme();
  
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: 'background.paper',
        borderTop: `1px solid ${theme.palette.divider}`
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
            color="text.secondary"
            sx={{ mb: { xs: 2, md: 0 } }}
          >
            &copy; {new Date().getFullYear()} Chess App. All rights reserved.
          </Typography>
          
          <Stack 
            direction="row" 
            spacing={3}
            divider={<Divider orientation="vertical" flexItem />}
          >
            <Link 
              href="#" 
              color="text.secondary"
              underline="hover"
              sx={{ 
                fontSize: '0.875rem',
                '&:hover': {
                  color: 'primary.main',
                }
              }}
            >
              Terms of Service
            </Link>
            <Link 
              href="#" 
              color="text.secondary"
              underline="hover"
              sx={{ 
                fontSize: '0.875rem',
                '&:hover': {
                  color: 'primary.main',
                }
              }}
            >
              Privacy Policy
            </Link>
            <Link 
              href="#" 
              color="text.secondary"
              underline="hover"
              sx={{ 
                fontSize: '0.875rem',
                '&:hover': {
                  color: 'primary.main',
                }
              }}
            >
              Contact
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
