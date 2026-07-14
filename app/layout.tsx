import type { Metadata } from 'next';
import { Inter, Cairo } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const cairo = Cairo({ subsets: ['arabic'], variable: '--font-cairo' });

export const metadata: Metadata = {
  title: 'Melina Chic - Modest Fashion & Beauty | Algeria',
  description: 'Modest fashion, hijabs, shoes, cosmetics & accessories for Algerian women. Free delivery across all 58 wilayas. Cash on delivery.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${inter.className} ${cairo.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
