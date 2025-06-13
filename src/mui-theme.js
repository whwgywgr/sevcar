// You can customize the MUI theme here if needed
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#000' },
        secondary: { main: '#111' },
        background: {
            default: '#fff',
            paper: '#fff',
        },
        text: {
            primary: '#000',
            secondary: '#222',
        },
    },
    shape: { borderRadius: 0 },
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
                body { background: #fff; }
                #root, .app-bg, .app-container {
                    max-width: 90vw !important;
                    width: 90%;
                    margin-left: auto;
                    margin-right: auto;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
            `,
        },
    },
});

export default theme;
