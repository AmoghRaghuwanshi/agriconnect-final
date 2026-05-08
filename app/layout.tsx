import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'AgriConnect — Farm-to-Table Marketplace',
    template: '%s | AgriConnect',
  },
  description:
    'AgriConnect connects farmers directly with consumers and wholesalers. Fresh produce, fair prices, zero middlemen.',
  keywords: ['agriculture', 'farm fresh', 'organic', 'marketplace', 'farmers', 'India'],
  openGraph: {
    title: 'AgriConnect — Farm-to-Table Marketplace',
    description: 'Fresh produce directly from Indian farmers.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Figtree:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="grain">
        {children}
      </body>
    </html>
  );
}
