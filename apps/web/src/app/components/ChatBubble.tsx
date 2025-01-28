'use client'

import { useEffect, useCallback, useRef } from 'react'
import { theme } from '@repo/shared'
import { useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useIndicator } from '@/contexts/IndicatorContext';
import { ChatService } from '@/utils/chatClient';
import { apiClient } from '@/utils/apiClient'

//Preload images and get data URLs
const preloadImages = async (images: string[]): Promise<Record<string, string>> => {
  const loadImage = (src: string): Promise<[string, string]> =>
    new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          resolve([src, canvas.toDataURL('image/png')])
        } else {
          reject(new Error('Failed to get canvas context'))
        }
      }
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
      img.src = src
    })

  try {
    const results = await Promise.all(images.map(loadImage))
    return Object.fromEntries(results)
  } catch (error) {
    console.error('Failed to preload images:', error)
    // Return original URLs as fallback
    return Object.fromEntries(images.map(src => [src, src]))
  }
}

// Constants
const CHATBOT_CONFIG = {
  FLOW_ID: "104f68db-a8d6-4135-acfc-6bb496040981",
  API_HOST: '', // Empty string to use relative paths from root
  ASSETS: {
    BOT_AVATAR: '/innocap_logo.png',
    USER_AVATAR: '/user.png',
  },
} as const;

export const ChatBubble = () => {
  const muiTheme = useTheme()
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'))
  const preloadedImages = useRef<Record<string, string>>({})
  const { selectedIndicator, pinnedIndicator } = useIndicator();
  const chatInitialized = useRef(false);

  const updateContext = useCallback(async () => {
    try {
      if (!selectedIndicator && !pinnedIndicator) {
        console.log('No indicators selected, skipping context update');
        return;
      }

      const response = await ChatService.processIndicators({
        selected: selectedIndicator ? {
          indicator: {
            id: selectedIndicator.id,
            indicatorNameEn: selectedIndicator.indicatorNameEn,
            indicatorType: selectedIndicator.indicatorType,
            group: selectedIndicator.group
          }
        } : undefined,
        pinned: pinnedIndicator ? {
          indicator: {
            id: pinnedIndicator.id,
            indicatorNameEn: pinnedIndicator.indicatorNameEn,
            indicatorType: pinnedIndicator.indicatorType,
            group: pinnedIndicator.group
          }
        } : undefined
      });
      if (!response.success) {
        throw new Error(response.error || 'Failed to process indicators');
      }

      return response;

    } catch (error) {
      console.error('Failed to update context:', error);
    }
  }, [selectedIndicator, pinnedIndicator]);

  const initChatbot = useCallback(async () => {
    try {
      preloadedImages.current = await preloadImages([
        CHATBOT_CONFIG.ASSETS.BOT_AVATAR,
        CHATBOT_CONFIG.ASSETS.USER_AVATAR
      ]);

      // Get initial context if indicators are selected
      let initialContext = {};
      if (selectedIndicator || pinnedIndicator) {
        const response = await ChatService.processIndicators({
          selected: selectedIndicator ? {
            indicator: {
              id: selectedIndicator.id,
              indicatorNameEn: selectedIndicator.indicatorNameEn,
              indicatorType: selectedIndicator.indicatorType,
              group: selectedIndicator.group
            }
          } : undefined,
          pinned: pinnedIndicator ? {
            indicator: {
              id: pinnedIndicator.id,
              indicatorNameEn: pinnedIndicator.indicatorNameEn,
              indicatorType: pinnedIndicator.indicatorType,
              group: pinnedIndicator.group
            }
          } : undefined
        });

        if (response.success && response.data) {
          initialContext = response.data;
        }
      }

      const chatbot = await import('flowise-embed/dist/web');
      chatbot.default.init({
        chatflowid: CHATBOT_CONFIG.FLOW_ID,
        apiHost: window.location.origin,
        chatflowConfig: {
          topK: 2,
          overrideConfig: {
            headers: apiClient.getSessionHeaders(),
            context: initialContext
          }
        },
        theme: {
          button: {
            backgroundColor: theme.palette.primary.light,
            size: 'medium',
            bottom: isMobile ? 70 : 20,
            dragAndDrop: true,
          },
          chatWindow: {
            welcomeMessage: 'Hi! How can I help you today with Mikkeli, Kangasniemi and Juva strategies?',
            backgroundColor: '#ffffff',
            height: 700,
            width: 500,
            fontSize: 14,
            starterPrompts: [
              'Can you summarize the strategies?',
              'How will strategies impact the environment?',
              'What are the main drivers for the strategies?'
            ],
            starterPromptFontSize: 12,
            botMessage: {
              textColor: '#303235',
              showAvatar: true,
              avatarSrc: preloadedImages.current[CHATBOT_CONFIG.ASSETS.BOT_AVATAR],
            },
            userMessage: {
              backgroundColor: theme.palette.primary.light,
              textColor: '#ffffff',
              showAvatar: true,
              avatarSrc: preloadedImages.current[CHATBOT_CONFIG.ASSETS.USER_AVATAR],
            },
            textInput: {
              placeholder: 'Type your question',
              backgroundColor: '#ffffff',
              textColor: '#303235',
              sendButtonColor: theme.palette.primary.light,
              maxChars: 200,
            },
            footer: {
              textColor: theme.palette.primary.light,
              text: 'Powered by',
              company: 'Mindhive',
              companyLink: 'https://mindhive.fi/mainio',
            },
            feedback: {
              color: theme.palette.primary.light,
            },
          }
        },
        observersConfig: {
          observeUserInput: async () => {
            if (selectedIndicator || pinnedIndicator) {
              const response = await updateContext();
              if (response?.data) {
                chatbot.default.init({
                  ...CHATBOT_CONFIG,
                  chatflowConfig: {
                    ...CHATBOT_CONFIG.chatflowConfig,
                    overrideConfig: {
                      context: response.data
                    }
                  }
                });
              }
            }
          },
          observeLoading: (loading) => {
            console.log('Loading state:', loading);
          }
        }
      });
      
      chatInitialized.current = true;
    } catch (error) {
      console.error('Failed to load chatbot:', error);
    }
  }, [isMobile, updateContext, selectedIndicator, pinnedIndicator]);

  // Initialize chat
  useEffect(() => {
    if (!chatInitialized.current) {
      initChatbot();
    }
  }, [initChatbot]);

  // Update context when indicators change
  useEffect(() => {
    if (chatInitialized.current && (selectedIndicator || pinnedIndicator)) {
      updateContext();
    }
  }, [selectedIndicator, pinnedIndicator, updateContext]);

  return null;
} 