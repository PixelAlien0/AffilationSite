import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KRIPPLINGFINDS — Women’s Fashion, Footwear & TikTok Outfit Directory',
  description: 'Shop curated women’s clothing, footwear, bags, and OOTD finds featured in @KripplingFinds TikTok short videos.',
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
