import type { Metadata } from 'next'
import { Cormorant_Garamond, Fraunces, Geist_Mono, Inclusive_Sans, Instrument_Serif } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'

import { ConditionalFooter } from '@/components/conditional-footer'
import { Header } from '@/components/header'
import { Toaster } from '@/components/ui/sonner'
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

/**
 * Page-preview heading serif (/for-cooks/become-a-cook — .font-heading-preview).
 * PENDING: user reviewing before possible site-wide rollout (Cormorant + Instrument Serif).
 */
const headingPreview = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-heading-preview',
  weight: ['500', '600', '700'],
})

/** Page-preview body serif (/for-cooks/become-a-cook only — opt-in via .become-cook-body-preview). */
const bodyPreview = Instrument_Serif({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body-preview',
  weight: '400',
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
      className={`${inclusiveSans.variable} ${headingFallback.variable} ${headingPreview.variable} ${bodyPreview.variable} ${geistMono.variable} bg-background`}
    >
      <body className="flex min-h-screen flex-col font-sans antialiased bg-background">
        <Header />
        <div className="flex-1">{children}</div>
        <ConditionalFooter />
        <Toaster richColors closeButton position="top-center" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
