// You can customize the MUI theme here if needed
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#2563eb' },
        secondary: { main: '#60a5fa' },
        background: {
            default: '#181e29',
            paper: 'rgba(30,41,59,0.65)',
        },
        text: {
            primary: '#f3f4f6',
            secondary: '#a5b4fc',
        },
    },
    shape: { borderRadius: 18 },
    typography: {
        fontFamily: 'Inter, Arial, sans-serif',
        fontWeightRegular: 400,
        fontWeightBold: 700,
        h5: { fontWeight: 700 },
        h6: { fontWeight: 700 },
        fontSize: 16,
        htmlFontSize: 16,
        // Responsive font size
        allVariants: {
            fontFamily: 'Inter, Arial, sans-serif',
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: `
                body { background: linear-gradient(120deg, #181e29 0%, #232b3b 100%); }
            `,
        },
    },
});

export default theme;
