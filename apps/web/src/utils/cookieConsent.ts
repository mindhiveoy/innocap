import 'vanilla-cookieconsent/dist/cookieconsent.css';
import * as CookieConsent from 'vanilla-cookieconsent';

export const COOKIE_CATEGORIES = {
  NECESSARY: 'necessary',
  ANALYTICS: 'analytics'
} as const;

export const initCookieConsent = () => {
  CookieConsent.run({
    categories: {
      [COOKIE_CATEGORIES.NECESSARY]: {
        enabled: true,
        readOnly: true
      },
      [COOKIE_CATEGORIES.ANALYTICS]: {
        enabled: false,
        autoClear: {
          cookies: [
            {
              name: /^_ga/,   // regex: match all cookies starting with '_ga'
            },
            {
              name: '_gid',
            }
          ]
        }
      }
    },

    guiOptions: {
      consentModal: {
        layout: 'box',
        position: 'bottom right',
        equalWeightButtons: true,
        flipButtons: false
      },
      preferencesModal: {
        layout: 'box',
        position: 'right',
        equalWeightButtons: true,
        flipButtons: false
      }
    },

    language: {
      default: 'en',
      translations: {
        en: {
          consentModal: {
            title: 'Privacy Settings',
            description: 'This website uses cookies to analyze our traffic and improve user experience.',
            acceptAllBtn: 'Accept all',
            acceptNecessaryBtn: 'Accept necessary only',
            showPreferencesBtn: 'Manage preferences',
            footer: '<a href="/privacy-policy" target="_blank">Privacy Policy</a>'
          },
          preferencesModal: {
            title: 'Cookie Preferences',
            acceptAllBtn: 'Accept all',
            acceptNecessaryBtn: 'Accept necessary only',
            savePreferencesBtn: 'Save preferences',
            closeIconLabel: 'Close modal',
            sections: [
              {
                title: 'How we use cookies',
                description: 'We use cookies to ensure basic functionality and analyze our traffic with anonymized data.'
              },
              {
                title: 'Strictly Necessary Cookies',
                description: 'These cookies are essential for the website to function properly.',
                linkedCategory: 'necessary'
              },
              {
                title: 'Analytics Cookies',
                description: 'These cookies help us understand how visitors interact with our website. All data is anonymized.',
                linkedCategory: 'analytics',
                cookieTable: {
                  headers: {
                    name: 'Cookie',
                    domain: 'Domain',
                    desc: 'Description'
                  },
                  body: [
                    {
                      name: '_ga',
                      domain: window.location.hostname,
                      desc: 'Google Analytics: Used to distinguish users'
                    },
                    {
                      name: '_gid',
                      domain: window.location.hostname,
                      desc: 'Google Analytics: Used to distinguish users'
                    }
                  ]
                }
              }
            ]
          }
        }
      }
    },

    cookie: {
      name: 'innocap_cookie_consent',
      expiresAfterDays: 100,
      useLocalStorage: true
    }
  });
};

export const getConsentStatus = () => {
  return CookieConsent.acceptedCategory();
};

export const openPreferences = () => {
  CookieConsent.showPreferences();
}; 