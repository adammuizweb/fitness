import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fitnes Tracker',
  description: 'Aplikasi fitness tracker dengan streak harian',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Fitnes',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#16a34a" />
      </head>
      <body className="min-h-full bg-gray-50 text-gray-900 font-sans">
        {children}
      </body>
    </html>
  )
}
