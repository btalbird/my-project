import type { Metadata } from 'next'
import { Fraunces, Geist_Mono, Inclusive_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'

import { Header } from '@/components/header'
import './globals.css'

const inclusiveSans = Inclusive_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inclusive-sans',
  weight: 'variable',
})

/** Display serif fallback until `public/fonts/roca-one.woff2` (Roca One) is added. */
const headingFallback = Fraunces({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-heading-fallback',
  weight: 'variable',
  axes: ['SOFT', 'WONK', 'opsz'],
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Munch - Food Delivery',
  description: 'Order food from your favorite restaurants, delivered to your door',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inclusiveSans.variable} ${headingFallback.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased bg-background">
        <Header />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
