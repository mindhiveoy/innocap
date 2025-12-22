import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  shape: {
    borderRadius: 8,
  },
  palette: {
    primary: {
      main: '#014B70',
      light: '#0A81B2',
      dark: '#083553',
      darkest: '#022640',
    },
    secondary: {
      main: '#E68939',
    },
    error: {
      main: '#E74C3C',
    },
    indicator: {
      blue: '#0A81B2',
      green: '#0AB28E',
      dark: '#100AB2',
    },
    gradient: {
      primary: 'linear-gradient(180deg, #0A81B2 0%, #083553 100%)',
    },
  },
  typography: {
    fontFamily: [
      'Open Sans',
      '-apple-system',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '20px',
      fontWeight: 700,
    },
    h2: {
      fontSize: '18px',
      fontWeight: 600,
    },
    lead: {
      fontSize: '14px',
      fontWeight: 500,
    },
    paragraph: {
      fontSize: '14px',
      fontWeight: 400,
      letterSpacing: '0.14px',
    },
    label: {
      fontSize: '16px',
      fontWeight: 600,
    },
    tabLabel: {
      fontSize: '12px',
      fontWeight: 600,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff',
          color: '#333',
          boxShadow: '0px 1px 4px rgba(100, 116, 139, 0.12)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 600,
        },
      },
    },
  },
});

export type Theme = typeof theme;