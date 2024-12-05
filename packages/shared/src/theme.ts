import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface PaletteColor {
    darkest?: string;
  }
  interface SimplePaletteColorOptions {
    darkest?: string;
  }
  interface Palette {
    indicator: {
      blue: string;
      green: string;
      dark: string;
    };
    gradient: {
      primary: string;
    };
  }
  interface PaletteOptions {
    indicator: {
      blue: string;
      green: string;
      dark: string;
    };
    gradient: {
      primary: string;
    };
  }
  interface TypographyVariants {
    lead: React.CSSProperties;
    paragraph: React.CSSProperties;
    label: React.CSSProperties;
    tabLabel: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    lead?: React.CSSProperties;
    paragraph?: React.CSSProperties;
    label?: React.CSSProperties;
    tabLabel?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    lead: true;
    paragraph: true;
    label: true;
    tabLabel: true;
  }
}

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