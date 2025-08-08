import type { Metadata } from 'next'
import { DM_Mono, Geist } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'
import Script from 'next/script'
import { UserStoreHydration } from '@/components/UserStoreHydration'
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
  title: 'Rettsai Legal Assistant',
  description:
    'An AI-powered assistant for legal research, document drafting, and compliance support.',
  keywords: [
    'AI Legal Assistant',
    'LegalAI',
    'Norway Legal AI',
    'Legal AI Norway',
    'Legal AI',
    'Internertional student legal aid',
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
      <head>
        <script
          defer
          src="https://analytics.rwaka.rw/script.js"
          data-website-id="beaba870-c958-480e-b11d-dea74f6d60c0"
        ></script>
      </head>
      <body className={`${geistSans.variable} ${dmMono.variable} antialiased`}>
        <UserStoreHydration />
        <NuqsAdapter>{children}</NuqsAdapter>
        <Toaster />
      </body>
    </html>
  )
}
