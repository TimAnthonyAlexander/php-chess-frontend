import { createTheme, alpha } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#60A5FA', dark: '#3B82F6' },
        secondary: { main: '#34D399' },
        background: { default: '#0B1220', paper: '#0F172A' },
        text: { primary: '#E5E7EB', secondary: 'rgba(229,231,235,0.72)' },
        divider: 'rgba(255,255,255,0.08)',
        success: { main: '#34D399' },
        warning: { main: '#FBBF24' },
        error: { main: '#EF4444' },
        info: { main: '#60A5FA' }
    },
    shape: { borderRadius: 8 },
    shadows: Array(25).fill('none') as any,
    typography: {
        fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
        h1: { fontWeight: 700, letterSpacing: '-0.005em' },
        h2: { fontWeight: 700, letterSpacing: '-0.005em' },
        h3: { fontWeight: 700, letterSpacing: '-0.004em' },
        h4: { fontWeight: 600, letterSpacing: '-0.003em' },
        h5: { fontWeight: 600, letterSpacing: '-0.002em' },
        h6: { fontWeight: 600, letterSpacing: '-0.001em' },
        button: { textTransform: 'none', fontWeight: 600 }
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                html: { WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' },
                body: { backgroundColor: '#0B1220', color: '#E5E7EB' }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: 'none',
                    border: '1px solid rgba(255,255,255,0.08)'
                }
            }
        },
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: 'none',
                    transition: 'background-color 120ms cubic-bezier(0.2,0,0,1)',
                    '&:focus-visible': {
                        outline: `2px solid ${alpha('#60A5FA', 0.48)}`,
                        outlineOffset: 2
                    }
                },
                outlined: {
                    borderColor: 'rgba(229,231,235,0.16)',
                    '&:hover': { backgroundColor: 'rgba(229,231,235,0.04)' }
                },
                text: {
                    '&:hover': { backgroundColor: 'rgba(229,231,235,0.04)' }
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: 'none',
                    border: '1px solid rgba(255,255,255,0.08)'
                }
            }
        },
        MuiFilledInput: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.16)',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.04)' },
                    '&.Mui-focused': {
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        borderColor: '#60A5FA',
                        outline: `2px solid ${alpha('#60A5FA', 0.32)}`
                    }
                }
            }
        },
        MuiTableContainer: {
            styleOverrides: {
                root: {
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8
                }
            }
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(255,255,255,0.02)'
                }
            }
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' }
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.16)',
                    boxShadow: 'none'
                }
            }
        }
    }
});

export default theme;
