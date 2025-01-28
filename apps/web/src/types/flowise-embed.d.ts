declare module 'flowise-embed/dist/web' {
  interface ChatbotConfig {
    chatflowid: string;
    apiHost?: string;
    chatflowConfig?: {
      topK?: number;
      overrideConfig?: {
        headers?: Record<string, string>;
        context?: {
          selected?: ProcessedIndicatorData;
          pinned?: ProcessedIndicatorData;
          specialStats?: string;
        };
      };
    };
    observersConfig?: {
      observeUserInput?: (userInput: string) => void;
      observeMessages?: (messages: unknown[]) => void;
      observeLoading?: (loading: boolean) => void;
    };
    theme?: {
      button?: {
        backgroundColor?: string;
        iconColor?: string;
        customIconSrc?: string;
        size?: number | 'small' | 'medium' | 'large';
        right?: number;
        bottom?: number;
        dragAndDrop?: boolean;
        autoWindowOpen?: {
          autoOpen?: boolean;
          openDelay?: number;
          autoOpenOnMobile?: boolean;
        };
      };
      chatWindow?: {
        welcomeMessage?: string;
        backgroundColor?: string;
        height?: number;
        width?: number;
        fontSize?: number;
        poweredByTextColor?: string;
        starterPrompts?: string[];
        starterPromptFontSize?: number;
        botMessage?: {
          backgroundColor?: string;
          textColor?: string;
          showAvatar?: boolean;
          avatarSrc?: string;
        };
        userMessage?: {
          backgroundColor?: string;
          textColor?: string;
          showAvatar?: boolean;
          avatarSrc?: string;
        };
        textInput?: {
          placeholder?: string;
          backgroundColor?: string;
          textColor?: string;
          sendButtonColor?: string;
          maxChars?: number;
        };
        footer?: {
          textColor?: string;
          text?: string;
          company?: string;
          companyLink?: string;
        };
        feedback?: {
          color?: string;
        };
      };
    };
  }

  const Chatbot: {
    init(config: ChatbotConfig): void;
  };

  export default Chatbot;
} 