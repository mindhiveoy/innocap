/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useIndicator } from '@/contexts/IndicatorContext';
import { useEffect, useCallback, useState, useRef } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';

// Enforce chat configuration constants
const CHAT_CONFIG = {
  BASE_URL: 'https://innocap.mainio.app',
  TENANT_ID: 'cm71il9xt010smk01yt5dln12',
  AGENT_ID: 'cm71v5vek010umk01wl5ge6tm',
  SUPPORTED_LANGUAGES: ['en', 'fi', 'sv', 'de', 'es', 'fr'] as const,
  DEFAULT_LANGUAGE: 'fi' as const,
} as const;

interface MainioChat {
  init: (config: {
    tenantId: string;
    agentId: string;
    baseUrl: string;
    floating: boolean;
    initiallyOpen: boolean;
    initialLanguage?: string;
    languages?: {
      supported: string[];
      default: string;
    };
  }) => void;
  setCustomVariables: (variables: Record<string, any>) => void;
}

declare global {
  interface Window {
    mainioChat?: MainioChat;
  }
}

export function EmbeddableChat() {
  const { selectedIndicator, pinnedIndicator } = useIndicator();
  const { t, i18n } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isChatInitialized, setIsChatInitialized] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const updateChatVariables = useCallback(() => {
    if (!isChatInitialized || !window.mainioChat?.setCustomVariables) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      const variables = {
        selected: selectedIndicator?.id || '',
        pinned: pinnedIndicator?.id || ''
      };

      // Only update and log if we have actual values
      if (variables.selected || variables.pinned) {
        try {      
          window.mainioChat?.setCustomVariables(variables);
        } catch (error) {
          console.warn('Failed to update chat variables:', error);
          setError('Failed to update chat variables');
        }
      }
    }, 100); // Small delay to batch updates
  }, [selectedIndicator, pinnedIndicator, isChatInitialized]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Create container div
    const container = document.createElement('div');
    container.setAttribute('data-mainio-agent', '');
    document.body.appendChild(container);

    // Create and inject script tag
    const script = document.createElement('script');
    script.type = 'module';
    script.crossOrigin = 'anonymous';
    script.src = `${CHAT_CONFIG.BASE_URL}/embeddable-chat/embed.js`;
    script.onload = () => {
      if (window.mainioChat) {
                // Get current language from i18n
        const currentLang = i18n.language.split('-')[0]; // Handle cases like 'en-US' -> 'en'
        
        // Check if current language is supported, otherwise use default
        const initialLanguage = CHAT_CONFIG.SUPPORTED_LANGUAGES.includes(currentLang as any) 
          ? currentLang 
          : CHAT_CONFIG.DEFAULT_LANGUAGE;
        window.mainioChat.init({
          tenantId: CHAT_CONFIG.TENANT_ID,
          agentId: CHAT_CONFIG.AGENT_ID,
          baseUrl: CHAT_CONFIG.BASE_URL,
          floating: true,
          initiallyOpen: false,
          initialLanguage,
          languages: {
            supported: [...CHAT_CONFIG.SUPPORTED_LANGUAGES],
            default: CHAT_CONFIG.DEFAULT_LANGUAGE,
          },
        });
        setIsChatInitialized(true);
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
      setIsChatInitialized(false);
    };
  }, [t, i18n.language]);

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