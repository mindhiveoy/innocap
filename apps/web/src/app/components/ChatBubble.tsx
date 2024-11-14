'use client'

import { useEffect, useCallback } from 'react'

interface FlowiseConfig {
  chatflowid: string
  apiHost: string
}

declare global {
  interface Window {
    Chatbot?: {
      init: (config: FlowiseConfig) => void
      close: () => void
    }
  }
}

export const ChatBubble = () => {
  const loadChatbot = useCallback(async () => {
    try {
      if (!window.Chatbot) {
        await import('flowise-embed/dist/web')
      }

      window.Chatbot?.init({
        chatflowid: "5f815f00-6aa4-4d73-801c-5623185319ba",
        apiHost: "https://bot.mindhive.fi"
      })
    } catch (error) {
      console.error('Failed to load chatbot:', error)
    }
  }, [])

  useEffect(() => {
    loadChatbot()

    return () => {
      window.Chatbot?.close()
    }
  }, [loadChatbot])

  return null
} 