import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import DeckBuilder from '@/components/DeckBuilder'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import ScrollReveal from '@/components/ScrollReveal'
import { getFilteredQuestions, type Occasion } from '@/lib/questions'
import Link from 'next/link'

interface OccasionConfig {
  slug: string
  occasion: Occasion
  title: string
  h1: string
  description: string
  relatedTones: string[]
}

const OCCASION_CONFIGS: OccasionConfig[] = [
  {
    slug: 'date-night-questions',
    occasion: 'date_night',
    title: 'Date Night Questions — Icebreaker Deck',
    h1: 'Date Night Questions',
    description: 'Curated conversation starters for date nights. Deep, flirty, and fun questions to spark connection with your partner.',
    relatedTones: ['deep', 'flirty', 'spicy', 'funny'],
  },
  {
    slug: 'team-icebreakers',
    occasion: 'team',
    title: 'Team Icebreaker Questions — Icebreaker Deck',
    h1: 'Team Icebreaker Questions',
    description: 'Fun and engaging icebreaker questions for team offsites, meetings, and work events. Build connection without the awkwardness.',
    relatedTones: ['funny', 'deep', 'random'],
  },
  {
    slug: 'family-dinner-questions',
    occasion: 'family',
    title: 'Family Dinner Questions — Icebreaker Deck',
    h1: 'Family Dinner Questions',
    description: 'Wholesome conversation starters for family dinners. Fun questions for all ages that get everyone talking.',
    relatedTones: ['funny', 'deep', 'random'],
  },
  {
    slug: 'party-questions',
    occasion: 'party',
    title: 'Party Questions & Conversation Games — Icebreaker Deck',
    h1: 'Party Questions',
    description: 'The best questions for parties and game nights. Funny, spicy, and random conversation starters to keep the energy going.',
    relatedTones: ['funny', 'spicy', 'random', 'weird'],
  },
  {
    slug: 'conversation-starters',
    occasion: 'all',
    title: 'Conversation Starters — Icebreaker Deck',
    h1: 'Conversation Starters',
    description: 'Over 17,000 conversation starters for every occasion. Spin, lock, and build your perfect question deck.',
    relatedTones: ['funny', 'deep', 'spicy', 'random', 'challenging'],
  },
]

const configBySlug = new Map(OCCASION_CONFIGS.map((c) => [c.slug, c]))

export function generateStaticParams() {
  return OCCASION_CONFIGS.map((c) => ({ occasion: c.slug }))
}

export function generateMetadata({ params }: { params: { occasion: string } }): Metadata {
  const config = configBySlug.get(params.occasion)
  if (!config) return {}
  return {
    title: config.title,
    description: config.description,
    openGraph: {
      title: config.h1,
      description: config.description,
    },
  }
}

export default function OccasionPage({ params }: { params: { occasion: string } }) {
  const config = configBySlug.get(params.occasion)
  if (!config) notFound()

  const questions = getFilteredQuestions({
    occasion: config.occasion,
    limit: 30,
  })

  // JSON-LD FAQPage schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.slice(0, 20).map((q) => ({
      '@type': 'Question',
      name: q.text,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.format === 'binary'
          ? `Choose between: ${q.optionA} or ${q.optionB}`
          : 'This is an open-ended conversation starter. There is no right or wrong answer — use it to spark meaningful dialogue.',
      },
    })),
  }

  return (
    <main className="min-h-screen">
      <ScrollReveal />
      <SiteHeader />

      <section className="px-4 sm:px-6 pt-8 pb-16 sm:pt-12 sm:pb-24">
        <div className="max-w-6xl mx-auto">
          <h1
            className="font-display text-3xl sm:text-4xl mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            {config.h1}
          </h1>
          <p
            className="text-base sm:text-lg mb-8 max-w-2xl"
            style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}
          >
            {config.description}
          </p>
        </div>

        {/* Interactive spinner pre-filtered */}
        <DeckBuilder />

        {/* Curated question list */}
        <div className="max-w-3xl mx-auto mt-16">
          <hr className="rams-divider-thick mb-8" />
          <h2
            className="font-display text-2xl mb-6"
            style={{ color: 'var(--text-primary)' }}
          >
            {questions.length} {config.h1}
          </h2>

          <ol className="space-y-4">
            {questions.map((q, i) => (
              <li
                key={q.id}
                className="p-4"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div className="flex gap-3">
                  <span
                    className="font-mono text-xs mt-0.5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {i + 1}.
                  </span>
                  <div>
                    <p
                      className="text-sm font-medium mb-1"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {q.text}
                    </p>
                    {q.tones.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {q.tones.map((t) => (
                          <span
                            key={t}
                            className="font-mono px-1.5 py-0.5"
                            style={{
                              fontSize: '0.6rem',
                              color: 'var(--text-muted)',
                              background: 'var(--bg-inset)',
                              borderRadius: 'var(--radius-sm)',
                              textTransform: 'uppercase',
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>

          {/* Related pages */}
          <div className="mt-12">
            <h3
              className="font-mono text-xs uppercase tracking-widest mb-4"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Related
            </h3>
            <div className="flex flex-wrap gap-2">
              {config.relatedTones.map((tone) => (
                <Link
                  key={tone}
                  href={`/${config.slug}/${tone}`}
                  className="font-mono text-xs px-3 py-2 transition-colors duration-200"
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {tone} {config.h1.toLowerCase()}
                </Link>
              ))}
              {OCCASION_CONFIGS.filter((c) => c.slug !== config.slug).map((c) => (
                <Link
                  key={c.slug}
                  href={`/${c.slug}`}
                  className="font-mono text-xs px-3 py-2 transition-colors duration-200"
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {c.h1}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </main>
  )
}
