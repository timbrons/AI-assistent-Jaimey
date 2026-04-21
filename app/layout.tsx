import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: "Jaimey's Slimme Assistent 🚀",
  description: 'Een slimme AI assistent voor Jaimey om kennisvragen te stellen over de wereld!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className="h-full">
      <body className={`${nunito.variable} font-nunito antialiased h-full`}>
        {children}
      </body>
    </html>
  );
}
