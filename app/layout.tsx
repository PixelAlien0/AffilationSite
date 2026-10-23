import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FEATURED IN VIDEOS — PRODUCT DIRECTORY',
  description: 'Direct links to products featured in our short-form videos.',
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
