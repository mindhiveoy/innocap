'use client'

import { useEffect, useCallback, useRef } from 'react'
import { theme } from '@repo/shared'
import { useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useIndicator } from '@/contexts/IndicatorContext';
import { useData } from '@/contexts/DataContext';
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
  FLOW_ID: "5f815f00-6aa4-4d73-801c-5623185319ba",
  API_HOST: "http://localhost:3001",
  MIDDLEWARE_URL: "http://localhost:3001",
  ASSETS: {
    BOT_AVATAR: '/innocap_logo.png',
    USER_AVATAR: '/user.png',
  },
} as const;

export const ChatBubble = () => {
  const muiTheme = useTheme()
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'))
  const preloadedImages = useRef<Record<string, string>>({})
  const { selectedIndicator } = useIndicator()
  const { municipalityData } = useData()
   console.log("🚀 ~ ChatBubble ~ municipalityData:", municipalityData)
  console.log("🚀 ~ ChatBubble ~ selectedIndicator:", selectedIndicator)

  const initChatbot = useCallback(async () => {
    try {
      preloadedImages.current = await preloadImages([
        CHATBOT_CONFIG.ASSETS.BOT_AVATAR,
        CHATBOT_CONFIG.ASSETS.USER_AVATAR
      ])

      const chatbot = await import('flowise-embed/dist/web')
      chatbot.default.init({
        chatflowid: CHATBOT_CONFIG.FLOW_ID,
        apiHost: CHATBOT_CONFIG.API_HOST,
        chatflowConfig: {
          topK: 2
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
            width: 400,
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
          observeUserInput: (userInput) => {
            // Add custom event with context data
            const event = new CustomEvent('flowiseRequest', {
              detail: {
                selectedIndicator,
                municipalityData
              }
            });
            window.dispatchEvent(event);
            console.log('User input:', userInput);
          },
          observeMessages: (messages) => {
            console.log('Messages:', messages);
          },
          observeLoading: (loading) => {
            console.log('Loading state:', loading);
          }
        }
      });
    } catch (error) {
      console.error('Failed to load chatbot:', error)
    }
  }, [isMobile, selectedIndicator, municipalityData])

  useEffect(() => {
    initChatbot()
  }, [initChatbot])

  useEffect(() => {
    // Define the event type
    type FlowiseRequestEvent = CustomEvent<{
      selectedIndicator: typeof selectedIndicator;
      municipalityData: typeof municipalityData;
    }>;

    const handleFlowiseRequest = async (event: Event) => {
      try {
        const customEvent = event as FlowiseRequestEvent;
        await fetch(`${CHATBOT_CONFIG.MIDDLEWARE_URL}/api/context`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customEvent.detail)
        });
      } catch (error) {
        console.error('Failed to update context:', error);
      }
    };

    window.addEventListener('flowiseRequest', handleFlowiseRequest);
    return () => {
      window.removeEventListener('flowiseRequest', handleFlowiseRequest);
    };
  }, [selectedIndicator, municipalityData]);

  return null
} 