import '@emotion/react';
import type { Theme as MUITheme } from '@mui/material/styles';

declare module '@emotion/react' {
  export interface Theme extends MUITheme {
    /**
     * Marker field to avoid `@typescript-eslint/no-empty-object-type` while keeping this a pure extension of MUI's Theme.
     */
    __emotionTheme?: never;
  }
} 