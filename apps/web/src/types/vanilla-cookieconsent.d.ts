import 'vanilla-cookieconsent';

declare module 'vanilla-cookieconsent' {
  interface CookieOptions {
    name?: string;
    expiresAfterDays?: number;
    domain?: string;
    path?: string;
    sameSite?: 'Strict' | 'Lax' | 'None';
    secure?: boolean;
    useLocalStorage?: boolean;
  }

  interface CookieConsentConfig {
    categories: {
      [key: string]: {
        enabled: boolean;
        readOnly?: boolean;
        autoClear?: {
          cookies: Array<{
            name: string | RegExp;
          }>;
        };
      };
    };
    guiOptions: {
      consentModal: {
        layout: string;
        position: string;
        equalWeightButtons: boolean;
        flipButtons: boolean;
      };
      preferencesModal: {
        layout: string;
        position: string;
        equalWeightButtons: boolean;
        flipButtons: boolean;
      };
    };
    language: {
      default: string;
      translations: {
        [key: string]: {
          consentModal: {
            title: string;
            description: string;
            acceptAllBtn: string;
            acceptNecessaryBtn: string;
            showPreferencesBtn: string;
            footer?: string;
          };
          preferencesModal: {
            title: string;
            acceptAllBtn: string;
            acceptNecessaryBtn: string;
            savePreferencesBtn: string;
            closeIconLabel: string;
            sections: Array<{
              title: string;
              description: string;
              linkedCategory?: string;
              cookieTable?: {
                headers: {
                  [key: string]: string;
                };
                body: Array<{
                  [key: string]: string;
                }>;
              };
            }>;
          };
        };
      };
    };
    cookie?: CookieOptions;
    storage?: {
      name?: string;
      mode?: 'cookie' | 'localStorage' | 'both';
      expiresAfterDays?: number;
    };
  }

  export function run(config: CookieConsentConfig): void;
  export function acceptedCategory(): string[];
  export function showPreferences(): void;
} 