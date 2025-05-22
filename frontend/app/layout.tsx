import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'
// Import the client component wrapper directly
import LogoutButtonWrapper from './components/LogoutButtonWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Study Tracker',
  description: 'Track and visualize student performance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {/* Global logout button that appears on all pages */}
          <LogoutButtonWrapper />
          {children}
        </Providers>
      </body>
    </html>
  )
}
