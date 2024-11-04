import '@emotion/react';
import type { Theme as MUITheme } from '@mui/material/styles';

declare module '@emotion/react' {
  export interface Theme extends MUITheme { }
} 