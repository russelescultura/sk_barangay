import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import React from 'react'
import './globals.css'
import 'leaflet/dist/leaflet.css'

import { ConfirmationProvider } from '@/components/ui/confirmation-dialog'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { ToastProvider } from '@/components/ui/toast'
import { AuthProvider } from '@/lib/auth'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SK Barangay Tulay - Empowering Youth, Building Community',
  description: 'Official website of SK Barangay Tulay. Empowering youth leadership and community development through active participation in local governance.',
  keywords: 'SK Barangay Tulay, Sangguniang Kabataan, youth leadership, community development, barangay tulay',
  authors: [{ name: 'SK Barangay Tulay' }],
  creator: 'SK Barangay Tulay',
  publisher: 'SK Barangay Tulay',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://sk-tulay.gov.ph'),
  openGraph: {
    title: 'SK Barangay Tulay - Empowering Youth, Building Community',
    description: 'Official website of SK Barangay Tulay. Empowering youth leadership and community development.',
    url: 'https://sk-tulay.gov.ph',
    siteName: 'SK Barangay Tulay',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SK Barangay Tulay - Empowering Youth, Building Community',
    description: 'Official website of SK Barangay Tulay. Empowering youth leadership and community development.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Handle service worker issues in development
              if (typeof window !== 'undefined') {
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for(let registration of registrations) {
                      registration.unregister();
                    }
                  });
                }
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            <ConfirmationProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </ConfirmationProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 