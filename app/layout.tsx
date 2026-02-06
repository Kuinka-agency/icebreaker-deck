import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Icebreaker Deck — Build Conversation Packs',
  description: 'Build curated conversation packs from 17,000+ questions. Spin, lock, and save decks for date nights, team offsites, family dinners, and parties.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        {children}
      </body>
    </html>
  )
}
