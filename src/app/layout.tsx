import type { Metadata } from 'next'
import { DM_Mono, Geist } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'
import Script from 'next/script'
const geistSans = Geist({
  variable: '--font-geist-sans',
  weight: '400',
  subsets: ['latin']
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: '400'
})

export const metadata: Metadata = {
  title: 'Rwaka Legal Assistant',
  description:
    'An AI-powered assistant for legal research, document drafting, and compliance support.',
  keywords: [
    'AI Legal Assistant',
    'LegalTech',
    'Document Drafting',
    'Case Law',
    'Compliance'
  ],
  authors: [{ name: 'Lexnovai.com', url: 'https://lexnovai.com' }]
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${dmMono.variable} antialiased`}>
        <Script
          defer
          src="https://analytics.rwaka.rw/script.js"
          data-website-id="c78a3f85-1967-425c-88e9-3c99e0513f7a"
        />
        <NuqsAdapter>{children}</NuqsAdapter>
        <Toaster />
      </body>
    </html>
  )
}
