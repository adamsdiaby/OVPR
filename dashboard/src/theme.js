import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#6B46C1',
            light: '#9B7EDB',
            dark: '#4A2F8C',
        },
        secondary: {
            main: '#FF9800',
            light: '#FFB74D',
            dark: '#F57C00',
        },
        error: {
            main: '#f44336',
            light: '#e57373',
            dark: '#d32f2f',
        },
        success: {
            main: '#4CAF50',
            light: '#81C784',
            dark: '#388E3C',
        },
        warning: {
            main: '#FF9800',
            light: '#FFB74D',
            dark: '#F57C00',
        },
        itemStatus: {
            stolen: '#6B46C1',
            forgotten: '#FF9800',
            lost: '#f44336',
            found: '#4CAF50'
        },
        background: {
            default: '#F4F6F8',
            paper: '#FFFFFF'
        },
        text: {
            primary: '#2D3748',
            secondary: '#718096'
        },
    },
    typography: {
        fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
    },
});

export default theme;