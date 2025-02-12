'use client';

import { useIndicator } from '@/contexts/IndicatorContext';
import { useEffect, useCallback } from 'react';

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

  const updateChatVariables = useCallback(() => {
    if (window.mainioChat?.setCustomVariables) {
      // Convert the nested object structure to a flattened string record
      // to match the embed.ts implementation
      window.mainioChat.setCustomVariables({
        'selected.indicator.id': selectedIndicator?.id || '',
        'pinned.indicator.id': pinnedIndicator?.id || ''
      });
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
        console.log('Initializing chat with baseUrl:', botServerUrl);
        window.mainioChat.init({
          tenantId: "development",
          agentId: "cm71lffmn000225neheahlvda",
          baseUrl: botServerUrl,
          floating: true,
          initiallyOpen: false,
        });
      }
    };
    script.onerror = (e) => {
      console.error("Failed to load the chat module:", e);
    };
    document.body.appendChild(script);

    // Cleanup function
    return () => {
      container.remove();
      script.remove();
    };
  }, [updateChatVariables]);

  useEffect(() => {
    updateChatVariables();
  }, [updateChatVariables]);

  return null;
}