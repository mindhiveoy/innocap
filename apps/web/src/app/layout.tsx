'use client';

import { Open_Sans } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { DataProvider } from '@/contexts/DataContext';
import { IndicatorProvider } from '@/contexts/IndicatorContext';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
// import future chatbot component here
// import { AIChat } from '@/components/AIChat';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { initCookieConsent } from '@/utils/cookieConsent';
import { initGA } from '@/utils/analytics';
import { useAnalyticsConsent } from '@/hooks/useAnalyticsConsent';
import '@/i18n/config';

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hasAnalyticsConsent = useAnalyticsConsent();
  const { isEnabled: isChatEnabled, isLoading: isChatFlagLoading } = useFeatureFlag('enableAIChat');
  
  useEffect(() => {
    initCookieConsent();
  }, []);

  useEffect(() => {
    if (hasAnalyticsConsent) {
      initGA();
    }
  }, [hasAnalyticsConsent]);

  return (
    <html lang="en" className={openSans.className}>
      <body>
        <Providers>
          <DataProvider>
            <IndicatorProvider>
              {children}
              {/* Changed condition to only check isEnabled */}
              {isChatEnabled && (
                <div 
                  style={{ 
                    position: 'fixed', 
                    bottom: 20, 
                    right: 20, 
                    backgroundColor: 'white', 
                    padding: '10px', 
                    borderRadius: '5px', 
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000,
                    opacity: isChatFlagLoading ? 0 : 1,
                    transition: 'opacity 0.3s ease-in-out'
                  }}
                >
                  Chat
                </div>
              )}
            </IndicatorProvider>
          </DataProvider>
        </Providers>
      </body>
    </html>
  );
}
