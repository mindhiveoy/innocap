'use client'

import { useEffect, useCallback, useRef } from 'react'
import { theme } from '@repo/shared'
import { useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useIndicator } from '@/contexts/IndicatorContext';
import { useData } from '@/contexts/DataContext';
import { processChatData } from '@/utils/chatDataProcessor';
//import WbIncandescentIcon from '@mui/icons-material/WbIncandescent';

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
  const { selectedIndicator, pinnedIndicator } = useIndicator();
  const { municipalityData, markerData, barChartData } = useData();
  const chatInitialized = useRef(false);

  const updateContext = useCallback(async () => {
    try {
      if (!selectedIndicator && !pinnedIndicator) {
        console.log('No indicators selected, skipping context update');
        return;
      }

      const processedData = processChatData(
        selectedIndicator,
        municipalityData,
        markerData,
        barChartData,
        pinnedIndicator,
        municipalityData,
        markerData,
        barChartData,
        '' 
      );

      const contextData = {
        selected: processedData.selected,
        pinned: processedData.pinned,
        specialStats: processedData.specialStats
      };

     // console.log('Full context data being sent:', JSON.stringify(contextData, null, 2));

      const response = await fetch(`${CHATBOT_CONFIG.MIDDLEWARE_URL}/api/context`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contextData)
      });

      const responseData = await response.json();
      console.log('Context update response:', responseData);
    } catch (error) {
      console.error('Failed to update context:', error);
    }
  }, [selectedIndicator, pinnedIndicator, municipalityData, markerData, barChartData]);

  const initChatbot = useCallback(async () => {
    try {
      preloadedImages.current = await preloadImages([
        CHATBOT_CONFIG.ASSETS.BOT_AVATAR,
        CHATBOT_CONFIG.ASSETS.USER_AVATAR
      ]);

      const chatbot = await import('flowise-embed/dist/web');
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
/*             customIconSrc: 'data:image/svg+xml;base64,' + btoa(`
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" style="transform: rotate(180deg)">
                <path d="M3.55 18.54l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8zM11 22.45h2V19.5h-2v2.95zM4 10.5H1v2h3v-2zm11-4.19V1.5H9v4.81C7.21 7.35 6 9.28 6 11.5c0 3.31 2.69 6 6 6s6-2.69 6-6c0-2.22-1.21-4.15-3-5.19zm5 4.19v2h3v-2h-3zm-2.76 7.66l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4z"/>
              </svg>
            `), */
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
          observeUserInput: () => {
            if (selectedIndicator || pinnedIndicator) {
              updateContext();
            }
          },
          observeLoading: (loading) => {
            console.log('Loading state:', loading);
          }
        }
      });
      
      chatInitialized.current = true;
      // Initial context update after chat is initialized
      updateContext();
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