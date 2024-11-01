import '@emotion/react';
import type { Theme as MUITheme } from '@mui/material/styles';

declare module '@emotion/react' {
  export interface Theme extends MUITheme {
    palette: MUITheme['palette'] & {
      indicator: {
        blue: string;
        green: string;
        dark: string;
      };
      gradient: {
        primary: string;
      };
    };
  }
} 