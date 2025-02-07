/* eslint-disable @typescript-eslint/no-explicit-any */
interface CookieStore {
  [key: string]: {
    value: string;
    expires?: Date;
    path?: string;
    isSession?: boolean;
  };
}

export class CookieManager {
  private static instance: CookieManager;
  private cookies: CookieStore = {};

  private constructor() {
    console.debug('🍪 CookieManager initialized');
  }

  static getInstance(): CookieManager {
    if (!CookieManager.instance) {
      CookieManager.instance = new CookieManager();
    }
    return CookieManager.instance;
  }

  private parseCookieString(cookieStr: string): { 
    key: string; 
    value: string; 
    expires?: Date;
    path?: string;
    isSession: boolean;
  } {
    const parts = cookieStr.split(';').map(part => part.trim());
    const [keyValue, ...options] = parts;
    const [key, value] = keyValue.split('=').map(s => s.trim());
    
    const parsed: any = { 
      key, 
      value, 
      isSession: true // Default to session cookie if no expiry
    };
    
    options.forEach(option => {
      const [optKey, optValue] = option.split('=').map(s => s.trim());
      const lowerKey = optKey.toLowerCase();
      if (lowerKey === 'expires') {
        parsed.expires = new Date(optValue);
        parsed.isSession = false;
      } else if (lowerKey === 'max-age') {
        const maxAge = parseInt(optValue, 10);
        if (!isNaN(maxAge)) {
          parsed.expires = new Date(Date.now() + maxAge * 1000);
          parsed.isSession = false;
        }
      } else if (lowerKey === 'path') {
        parsed.path = optValue;
      }
    });

    return parsed;
  }

  updateFromResponse(response: Response): void {
    const setCookieHeader = response.headers.get('set-cookie');
    console.debug('🍪 Received Set-Cookie header:', setCookieHeader);
    
    if (!setCookieHeader) {
      console.debug('🍪 No cookies in response');
      return;
    }

    // Split multiple cookies if present
    const cookieStrings = setCookieHeader.split(',').map(str => str.trim());
    console.debug('🍪 Processing cookies:', cookieStrings);
    
    cookieStrings.forEach((cookieStr: string) => {
      const parsed = this.parseCookieString(cookieStr);
      
      // Don't update existing session cookies
      if (parsed.isSession && this.cookies[parsed.key]?.value) {
        console.debug(`🍪 Keeping existing session cookie: ${parsed.key}`);
        return;
      }

      // Only update if not expired
      if (!parsed.expires || parsed.expires > new Date()) {
        this.cookies[parsed.key] = {
          value: parsed.value,
          expires: parsed.expires,
          path: parsed.path,
          isSession: parsed.isSession,
        };
        console.debug(`🍪 Stored cookie: ${parsed.key}=${parsed.value} (${parsed.isSession ? 'session' : 'expires: ' + parsed.expires})`);
      }
    });

    console.debug('🍪 Current cookie store:', this.cookies);
  }

  getHeaderString(): string {
    // Clean expired cookies first
    const now = new Date();
    Object.entries(this.cookies).forEach(([key, cookie]) => {
      if (cookie.expires && cookie.expires <= now) {
        delete this.cookies[key];
      }
    });

    const cookieHeader = Object.entries(this.cookies)
      .map(([key, cookie]) => `${key}=${cookie.value}`)
      .join('; ');
    
    console.debug('🍪 Sending cookies:', cookieHeader || 'none');
    return cookieHeader;
  }

  clear(): void {
    console.debug('🍪 Clearing cookie store');
    this.cookies = {};
  }
} 