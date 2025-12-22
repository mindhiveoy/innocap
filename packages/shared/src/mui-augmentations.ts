import type React from 'react';

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
