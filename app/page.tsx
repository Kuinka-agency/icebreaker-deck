import DeckBuilder from '@/components/DeckBuilder'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import ScrollReveal from '@/components/ScrollReveal'

export default function Home() {
  return (
    <main className="min-h-screen">
      <ScrollReveal />
      <SiteHeader />

      {/* Deck builder section */}
      <section className="px-4 sm:px-6 pt-8 pb-16 sm:pt-12 sm:pb-24">
        <DeckBuilder />
      </section>

      <SiteFooter />
    </main>
  )
}
