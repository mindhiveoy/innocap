'use client'

import { useEffect, useCallback, useRef } from 'react'
import { theme } from '@repo/shared'
import { useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'

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
  API_HOST: "https://bot.mindhive.fi",
  ASSETS: {
    BOT_AVATAR: '/innocap_logo.png',
    USER_AVATAR: '/user.png',
  },
} as const

export const ChatBubble = () => {
  const muiTheme = useTheme()
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'))
  const preloadedImages = useRef<Record<string, string>>({})

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
        }
      })
    } catch (error) {
      console.error('Failed to load chatbot:', error)
    }
  }, [isMobile])

  useEffect(() => {
    initChatbot()
  }, [initChatbot])
  
  return null
} 