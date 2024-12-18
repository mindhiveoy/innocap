import 'vanilla-cookieconsent/dist/cookieconsent.css';
import * as CookieConsent from 'vanilla-cookieconsent';
export const COOKIE_CATEGORIES = {
  NECESSARY: 'necessary',
  ANALYTICS: 'analytics'
} as const;

export const initCookieConsent = () => {
  // Add custom styles to match our theme
  const style = document.createElement('style');

  style.innerHTML = `
    #cc-main {
      /* Font */
      --cc-font-family: var(--font-open-sans);
      
      --cc-btn-primary-bg: #014B70;
      --cc-btn-primary-hover-bg: #083553;
      --cc-btn-primary-color: #FFFFFF;

      /* Toggle colors */
      --cc-toggle-on-bg: #014B70;
  `;
  document.head.appendChild(style);

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
                title: 'Necessary Cookies',
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
                      desc: 'Used by Google Analytics to distinguish unique users.'
                    },
                    {
                      name: '_gid',
                      domain: window.location.hostname,
                      desc: 'Used by Google Analytics to distinguish unique users.'
                    }
                  ]
                }
              }
            ]
          }
        },
        fi: {
          consentModal: {
            title: 'Yksityisyysasetukset',
            description: 'Tämä sivusto käyttää evästeitä liikenteen analysointiin ja käyttökokemuksen parantamiseen.',
            acceptAllBtn: 'Hyväksy kaikki',
            acceptNecessaryBtn: 'Hyväksy vain välttämättömät',
            showPreferencesBtn: 'Hallitse asetuksia',
          },
          preferencesModal: {
            title: 'Evästeasetukset',
            acceptAllBtn: 'Hyväksy kaikki',
            acceptNecessaryBtn: 'Hyväksy vain välttämättömät',
            savePreferencesBtn: 'Tallenna asetukset',
            closeIconLabel: 'Sulje ikkuna',
            sections: [
              {
                title: 'Miten käytämme evästeitä',
                description: 'Käytämme evästeitä varmistaaksemme perustoiminnallisuuden ja analysoidaksemme liikennettä anonymisoidulla datalla.'
              },
              {
                title: 'Välttämättömät evästeet',
                description: 'Nämä evästeet ovat välttämättömiä sivuston toiminnan kannalta.',
                linkedCategory: 'necessary'
              },
              {
                title: 'Analytiikkaevästeet',
                description: 'Nämä evästeet auttavat meitä ymmärtämään, miten kävijät käyttävät sivustoamme. Kaikki data on anonymisoitu.',
                linkedCategory: 'analytics',
                cookieTable: {
                  headers: {
                    name: 'Eväste',
                    domain: 'Verkkotunnus',
                    desc: 'Kuvaus'
                  },
                  body: [
                    {
                      name: '_ga',
                      domain: window.location.hostname,
                      desc: 'Google Analyticsin käyttämä eväste yksilöllisten käyttäjien tunnistamiseen.'
                    },
                    {
                      name: '_gid',
                      domain: window.location.hostname,
                      desc: 'Google Analyticsin käyttämä eväste yksilöllisten käyttäjien tunnistamiseen.'
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