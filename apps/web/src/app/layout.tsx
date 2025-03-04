import { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import { ClientLayout } from './client-layout';

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

// Define and export metadata directly here
export const metadata: Metadata = {
  title: 'Green transition in South Savo',
  description: 'Green and digital transition dashboard',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/innocap_logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/innocap_logo.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: [
      { url: '/innocap_logo.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/innocap_logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={openSans.className}>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
