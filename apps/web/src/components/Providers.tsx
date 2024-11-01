'use client';

import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { ThemeProvider as MaterialThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '@/theme/theme';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MaterialThemeProvider theme={theme}>
      <EmotionThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </EmotionThemeProvider>
    </MaterialThemeProvider>
  );
} 