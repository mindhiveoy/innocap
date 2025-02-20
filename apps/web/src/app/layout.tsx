'use client';

import { Open_Sans } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { DataProvider } from '@/contexts/DataContext';
import { IndicatorProvider } from '@/contexts/IndicatorContext';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { EmbeddableChat } from '@/components/EmbeddableChat';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { initCookieConsent } from '@/utils/cookieConsent';
import { initGA } from '@/utils/analytics';
import { useAnalyticsConsent } from '@/hooks/useAnalyticsConsent';
import '@/i18n/config';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/utils/analytics';

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
  const pathname = usePathname();
  const searchParams = useSearchParams();
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

  useEffect(() => {
    if (hasAnalyticsConsent) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      trackPageView(url);
    }
  }, [pathname, searchParams, hasAnalyticsConsent]);

  return (
    <html lang="en" className={openSans.className}>
      <body>
        <Providers>
          <DataProvider>
            <IndicatorProvider>
              {children}
              {isChatEnabled && !isChatFlagLoading && <EmbeddableChat />}
            </IndicatorProvider>
          </DataProvider>
        </Providers>
      </body>
    </html>
  );
}
