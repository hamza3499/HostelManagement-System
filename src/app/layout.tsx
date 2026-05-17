import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HMS - Hostel Management System',
  description: 'Modern AI-powered hostel management system for students and administrators.',
  keywords: 'hostel, management, rooms, booking, students',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            className: 'backdrop-blur-xl bg-slate-950/80 border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_15px_rgba(99,102,241,0.2)] text-white font-semibold rounded-2xl',
            style: {
              padding: '16px 20px',
            },
          }}
        />
      </body>
    </html>
  );
}
