declare module 'flowise-embed/dist/web' {
  interface ChatbotConfig {
    chatflowid: string;
    apiHost: string;
    theme?: {
      button?: {
        backgroundColor?: string;
        size?: 'small' | 'medium' | 'large';
        bottom?: number;
        right?: number;
        dragAndDrop?: boolean;
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
    interceptor?: {
      onMessage?: (message: string) => Promise<string>;
    }
  }

  const flowiseEmbed: {
    init: (config: ChatbotConfig) => void;
  };

  export default flowiseEmbed;
} 