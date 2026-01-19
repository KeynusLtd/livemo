import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#4F46E5', // Indigo 600 - Professional and Modern
            light: '#818CF8',
            dark: '#3730A3',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#10B981', // Emerald 500 - Success/Growth
            light: '#34D399',
            dark: '#059669',
            contrastText: '#ffffff',
        },
        background: {
            default: '#F3F4F6', // Light gray background for the dashboard
            paper: '#ffffff',
        },
        text: {
            primary: '#111827', // Gray 900
            secondary: '#6B7280', // Gray 500
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontSize: '2.5rem', fontWeight: 700 },
        h2: { fontSize: '2rem', fontWeight: 600 },
        h3: { fontSize: '1.75rem', fontWeight: 600 },
        h4: { fontSize: '1.5rem', fontWeight: 600 },
        h5: { fontSize: '1.25rem', fontWeight: 600 },
        h6: { fontSize: '1rem', fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: {
        borderRadius: 12, // Modern rounded corners
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '16px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // Soft shadow
                    border: '1px solid #E5E7EB',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRight: 'none',
                    boxShadow: '4px 0 24px rgba(0,0,0,0.02)',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    margin: '4px 8px',
                    '&.Mui-selected': {
                        backgroundColor: '#EEF2FF', // Indigo 50
                        color: '#4F46E5',
                        '&:hover': {
                            backgroundColor: '#E0E7FF',
                        },
                        '& .MuiListItemIcon-root': {
                            color: '#4F46E5',
                        },
                    },
                },
            },
        },
    },
});

export default theme;
