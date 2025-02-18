'use client';

import { useIndicator } from '@/contexts/IndicatorContext';
import { useEffect, useCallback, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface MainioChat {
  init: (config: {
    tenantId: string;
    agentId: string;
    baseUrl: string;
    floating: boolean;
    initiallyOpen: boolean;
  }) => void;
  // Update to match embed.ts type definition
  setCustomVariables: (variables: Record<string, string>) => void;
}

declare global {
  interface Window {
    mainioChat?: MainioChat;
  }
}

export function EmbeddableChat() {
  const { selectedIndicator, pinnedIndicator } = useIndicator();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const updateChatVariables = useCallback(() => {
    if (window.mainioChat?.setCustomVariables) {
      try {
        window.mainioChat.setCustomVariables({
          'selected.indicator.id': selectedIndicator?.id || '',
          'pinned.indicator.id': pinnedIndicator?.id || ''
        });
      } catch (error) {
        console.warn('Failed to update chat variables:', error);
      }
    }
  }, [selectedIndicator, pinnedIndicator]);

  useEffect(() => {
    const botServerUrl = 'http://localhost:3000';
    
    // Create container div
    const container = document.createElement('div');
    container.setAttribute('data-mainio-agent', '');
    document.body.appendChild(container);

    // Create and inject script tag
    const script = document.createElement('script');
    script.type = 'module';
    script.crossOrigin = 'anonymous';
    script.src = `${botServerUrl}/embeddable-chat/embed.js`;
    script.onload = () => {
      if (window.mainioChat) {
        window.mainioChat.init({
          tenantId: "development",
          agentId: "cm71lffmn000225neheahlvda",
          baseUrl: botServerUrl,
          floating: true,
          initiallyOpen: false,
        });
      }
    };
    script.onerror = () => {
      setError(t('errors.chatLoadFailed'));
    };
    document.body.appendChild(script);

    // Cleanup function
    return () => {
      container.remove();
      script.remove();
    };
  }, [updateChatVariables, t]);

  useEffect(() => {
    updateChatVariables();
  }, [updateChatVariables]);

  return (
    <Snackbar 
      open={!!error} 
      autoHideDuration={6000} 
      onClose={() => setError(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert 
        onClose={() => setError(null)} 
        severity="error" 
        variant="filled"
        sx={{ 
          width: '100%',
          backgroundColor: '#E74C3C',
          '& .MuiAlert-icon': {
            color: '#fff'
          }
        }}
      >
        {error}
      </Alert>
    </Snackbar>
  );
}