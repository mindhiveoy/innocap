'use client'

import { useEffect, useCallback, useRef } from 'react'
import { theme } from '@repo/shared'
import { useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// Types
interface BotMessageConfig {
  backgroundColor?: string
  textColor?: string
  showAvatar?: boolean
  avatarSrc?: string
}

interface TextInputConfig {
  placeholder?: string
  backgroundColor?: string
  textColor?: string
  sendButtonColor?: string
  maxChars?: number
  maxCharsWarningMessage?: string
}

interface ChatWindowConfig {
  showTitle?: boolean
  title?: string
  welcomeMessage?: string
  backgroundColor?: string
  height?: number
  width?: number
  fontSize?: number
  starterPrompts?: string[]
  starterPromptFontSize?: number
  clearChatOnReload?: boolean
  renderHTML?: boolean
  botMessage?: BotMessageConfig
  userMessage?: BotMessageConfig
  textInput?: TextInputConfig
  dateTimeToggle?: {
    date?: boolean
    time?: boolean
  }
  footer?: {
    textColor?: string
    text?: string
    company?: string
    companyLink?: string
    fontSize?: number
  }
}

interface FlowiseConfig {
  chatflowid: string
  apiHost: string
  theme?: {
    button?: {
      backgroundColor?: string
      size?: string
      bottom?: number
      dragAndDrop?: boolean
    }
    chatWindow?: ChatWindowConfig
  }
}

interface ChatbotType {
  init: (config: FlowiseConfig) => void
  close?: () => void
}

declare global {
  interface Window {
    Chatbot?: ChatbotType
  }
}

// Helper function to preload image and convert to data URL
const preloadImage = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      } else {
        reject(new Error('Failed to get canvas context'))
      }
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}

// Constants
const CHATBOT_CONFIG = {
  FLOW_ID: "5f815f00-6aa4-4d73-801c-5623185319ba",
  API_HOST: "https://bot.mindhive.fi",
  MAX_CHARS: 100,
  WINDOW: {
    HEIGHT: 700,
    WIDTH: 400,
    FONT_SIZE: 14,
    STARTER_PROMPT_SIZE: 12,
  },
  ASSETS: {
    BOT_AVATAR: '/innocap_logo.png',
    USER_AVATAR: 'https://raw.githubusercontent.com/zahidkhawaja/langchain-chat-nextjs/main/public/usericon.png',
  },
} as const

export const ChatBubble = () => {
  const isInitialized = useRef(false)
  const botAvatarDataUrl = useRef<string>('')
  const muiTheme = useTheme()
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'))

  // Preload bot avatar
  const preloadBotAvatar = useCallback(async () => {
    try {
      botAvatarDataUrl.current = await preloadImage(CHATBOT_CONFIG.ASSETS.BOT_AVATAR)
    } catch (error) {
      console.error('Failed to preload bot avatar:', error)
      botAvatarDataUrl.current = CHATBOT_CONFIG.ASSETS.BOT_AVATAR // Fallback to original URL
    }
  }, [])

  const getChatWindowConfig = useCallback((): ChatWindowConfig => ({
    welcomeMessage: 'Hi! How can I help you today with Mikkeli and Kangasniemi strategies?',
    backgroundColor: '#ffffff',
    height: CHATBOT_CONFIG.WINDOW.HEIGHT,
    width: CHATBOT_CONFIG.WINDOW.WIDTH,
    fontSize: CHATBOT_CONFIG.WINDOW.FONT_SIZE,
    starterPrompts: ['Can you summarize the strategies?', 'How will strategies impact the environment?', 'What are the main drivers for the strategies?'],
    starterPromptFontSize: CHATBOT_CONFIG.WINDOW.STARTER_PROMPT_SIZE,
    clearChatOnReload: false,
    botMessage: {
      backgroundColor: theme.palette.primary.light + '1A',
      textColor: '#303235',
      showAvatar: true,
      avatarSrc: botAvatarDataUrl.current, // Use the preloaded data URL
    },
    userMessage: {
      backgroundColor: theme.palette.primary.light,
      textColor: '#ffffff',
      showAvatar: true,
      avatarSrc: CHATBOT_CONFIG.ASSETS.USER_AVATAR,
    },
    textInput: {
      placeholder: 'Type your question',
      backgroundColor: '#ffffff',
      textColor: '#303235',
      sendButtonColor: theme.palette.primary.light,
      maxChars: CHATBOT_CONFIG.MAX_CHARS,
      maxCharsWarningMessage: `You exceeded the characters limit. Please input less than ${CHATBOT_CONFIG.MAX_CHARS} characters.`,
    },
    dateTimeToggle: {
      date: true,
      time: true,
    },
    footer: {
      textColor: theme.palette.primary.light,
      text: 'Powered by',
      company: 'Mindhive',
      companyLink: 'https://mindhive.fi',
    },
  }), [])

  const loadChatbot = useCallback(async () => {
    try {
      if (!window.Chatbot && !isInitialized.current) {
        await preloadBotAvatar()
        const chatbot = await import('flowise-embed/dist/web')
        window.Chatbot = chatbot.default as ChatbotType
        isInitialized.current = true

        window.Chatbot.init({
          chatflowid: CHATBOT_CONFIG.FLOW_ID,
          apiHost: CHATBOT_CONFIG.API_HOST,
          theme: {
            button: {
              backgroundColor: theme.palette.primary.light,
              size: 'medium',
              bottom: isMobile ? 70 : 20,
              dragAndDrop: true,
            },
            chatWindow: getChatWindowConfig(),
          }
        })
      }
    } catch (error) {
      console.error('Failed to load chatbot:', error)
    }
  }, [getChatWindowConfig, preloadBotAvatar, isMobile])

  useEffect(() => {
    loadChatbot()

    return () => {
      if (window.Chatbot?.close && typeof window.Chatbot.close === 'function') {
        try {
          window.Chatbot.close()
        } catch (error) {
          console.error('Failed to close chatbot:', error)
        }
      }
      isInitialized.current = false
    }
  }, [loadChatbot])

  return null
} 