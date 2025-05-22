import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Study Tracker",
  description: "Track your academic progress and performance",
};

'use client';

import { useEffect } from "react";
import dynamic from 'next/dynamic';

// Dynamically import the SuperLogoutButton with no SSR to prevent hydration issues
const SuperLogoutButton = dynamic(
  () => import('./components/SuperLogoutButton'),
  { ssr: false }
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Suppress hydration warnings
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (args.length > 0 && typeof args[0] === 'string') {
        if (args[0].includes('Warning: Text content did not match') ||
            args[0].includes('Warning: Expected server HTML to contain') ||
            args[0].includes('Hydration failed because') ||
            args[0].includes('hydration') ||
            args[0].includes('data-new-gr-c-s-check-loaded')) {
          return;
        }
      }
      originalError.apply(console, args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);
  
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Global Logout Button - Always Visible */}
        <div className="fixed bottom-4 left-4 z-[9999]">
          <button
            onClick={() => {
              console.log('Global logout button clicked');
              if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                window.location.href = '/signin';
              }
            }}
            className="px-6 py-4 bg-purple-700 hover:bg-purple-800 text-white font-extrabold rounded-lg shadow-lg border-4 border-purple-500"
          >
            GLOBAL LOGOUT
          </button>
        </div>
        
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
          {children}
        </div>
        
        {/* Using SuperLogoutButton at the root level */}
        <SuperLogoutButton />
      </body>
    </html>
  );
}
