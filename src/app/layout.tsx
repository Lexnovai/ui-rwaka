import type { Metadata } from 'next'
import { DM_Mono, Geist } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'
import Script from 'next/script'
import { UserStoreHydration } from '@/components/UserStoreHydration'
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton
} from '@clerk/nextjs'
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
    'LegalAI',
    'Rwanda Legal AI',
    'Legal AI Rwanda',
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
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${dmMono.variable} antialiased`}
        >
          <Script
            defer
            src="https://analytics.rwaka.rw/script.js"
            data-website-id="beaba870-c958-480e-b11d-dea74f6d60c0"
          ></Script>
          <header className="border-b">
            <div className="mx-auto flex max-w-screen-xl items-center justify-between p-3">
              <div className="font-semibold">Rwaka</div>
              <div className="flex gap-2">
                <SignedOut>
                  <SignInButton />
                  <SignUpButton />
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
          </header>
          <UserStoreHydration />
          <NuqsAdapter>{children}</NuqsAdapter>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
