import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ARCHIVE // TIKTOK PICKS — SWISS TECHNICAL INDEX',
  description: 'Curated field-tested equipment and direct stream deals.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
