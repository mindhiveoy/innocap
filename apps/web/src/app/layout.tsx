import type { Metadata } from "next";
import { Open_Sans } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { DataProvider } from '@/contexts/DataContext';
import { IndicatorProvider } from '@/contexts/IndicatorContext';
import { ChatBubble } from './components/ChatBubble'
import 'leaflet/dist/leaflet.css';

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: "Innocap",
  description: "Green and digital transition dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={openSans.className}>
      <body>
        <Providers>
          <DataProvider>
            <IndicatorProvider>
              {children}
            </IndicatorProvider>
          </DataProvider>
        </Providers>
        <ChatBubble />
      </body>
    </html>
  );
}
