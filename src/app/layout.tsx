import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EYEVENGERS | Festive Gaming & Optical Rewards • Jodhpur',
  description: 'Festive rewards and gaming portal for EYEVENGERS Optical Showroom, Jodhpur. Win vouchers, frames, and comprehensive vision checkups.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-[#21171A]">
      <body className="min-h-full flex flex-col bg-[#21171A] text-[#FFF4E3] antialiased selection:bg-[#E8C477] selection:text-[#21171A]">
        {children}
      </body>
    </html>
  );
}
