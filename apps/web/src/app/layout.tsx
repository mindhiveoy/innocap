import type { Metadata } from "next";
import { Providers } from '@/components/Providers';
import 'leaflet/dist/leaflet.css';

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
    <html lang="en">
      <head>

      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
