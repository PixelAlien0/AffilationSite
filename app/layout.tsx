import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KRIPPLINGFINDS — @KripplingFinds TikTok Shop & Viral Finds',
  description: 'Shop every viral item and daily find featured in @KripplingFinds TikTok videos.',
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
