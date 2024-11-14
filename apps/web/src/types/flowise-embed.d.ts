declare module 'flowise-embed/dist/web' {
  interface FlowiseConfig {
    chatflowid: string
    apiHost: string
    theme?: {
      button?: {
        backgroundColor?: string
        size?: string
      }
      chatWindow?: {
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
        botMessage?: {
          backgroundColor?: string
          textColor?: string
          showAvatar?: boolean
          avatarSrc?: string
        }
        userMessage?: {
          backgroundColor?: string
          textColor?: string
          showAvatar?: boolean
          avatarSrc?: string
        }
        textInput?: {
          placeholder?: string
          backgroundColor?: string
          textColor?: string
          sendButtonColor?: string
          maxChars?: number
          maxCharsWarningMessage?: string
        }
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
    }
  }

  interface Chatbot {
    init: (config: FlowiseConfig) => void
    close?: () => void
  }

  const chatbot: Chatbot
  export default chatbot
} 