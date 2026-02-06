import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import ScrollReveal from '@/components/ScrollReveal'
import DeckBuilder from '@/components/DeckBuilder'
import { getFilteredQuestions, type Occasion } from '@/lib/questions'
import Link from 'next/link'

interface OccasionToneConfig {
  occasionSlug: string
  occasion: Occasion
  occasionLabel: string
  tone: string
  title: string
  h1: string
  description: string
}

// Generate valid occasion+tone combinations
const OCCASIONS: { slug: string; occasion: Occasion; label: string; tones: string[] }[] = [
  { slug: 'conversation-starters', occasion: 'all', label: 'Conversation Starters', tones: ['deep', 'funny', 'spicy', 'random', 'challenging', 'weird'] },
  { slug: 'date-night-questions', occasion: 'date_night', label: 'Date Night Questions', tones: ['deep', 'funny', 'spicy', 'flirty'] },
  { slug: 'team-icebreakers', occasion: 'team', label: 'Team Icebreakers', tones: ['funny', 'deep', 'random'] },
  { slug: 'family-dinner-questions', occasion: 'family', label: 'Family Dinner Questions', tones: ['funny', 'deep', 'random'] },
  { slug: 'party-questions', occasion: 'party', label: 'Party Questions', tones: ['funny', 'spicy', 'random', 'weird'] },
]

const ALL_CONFIGS: OccasionToneConfig[] = OCCASIONS.flatMap((occ) =>
  occ.tones.map((tone) => ({
    occasionSlug: occ.slug,
    occasion: occ.occasion,
    occasionLabel: occ.label,
    tone,
    title: `${tone.charAt(0).toUpperCase() + tone.slice(1)} ${occ.label} — Icebreaker Deck`,
    h1: `${tone.charAt(0).toUpperCase() + tone.slice(1)} ${occ.label}`,
    description: `${tone.charAt(0).toUpperCase() + tone.slice(1)} ${occ.label.toLowerCase()} to spark great conversations. Curated from thousands of questions.`,
  }))
)

const configByKey = new Map(ALL_CONFIGS.map((c) => [`${c.occasionSlug}/${c.tone}`, c]))

export function generateStaticParams() {
  return ALL_CONFIGS.map((c) => ({
    occasion: c.occasionSlug,
    tone: c.tone,
  }))
}

export function generateMetadata({ params }: { params: { occasion: string; tone: string } }): Metadata {
  const config = configByKey.get(`${params.occasion}/${params.tone}`)
  if (!config) return {}
  return {
    title: config.title,
    description: config.description,
    openGraph: { title: config.h1, description: config.description },
  }
}

export default function OccasionTonePage({
  params,
}: {
  params: { occasion: string; tone: string }
}) {
  const config = configByKey.get(`${params.occasion}/${params.tone}`)
  if (!config) notFound()

  const questions = getFilteredQuestions({
    occasion: config.occasion,
    tone: config.tone,
    limit: 30,
  })

  // Don't render thin pages
  if (questions.length < 15) notFound()

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
          : 'This is an open-ended conversation starter designed to spark meaningful dialogue.',
      },
    })),
  }

  return (
    <main className="min-h-screen">
      <ScrollReveal />
      <SiteHeader />

      <section className="px-4 sm:px-6 pt-8 pb-16 sm:pt-12 sm:pb-24">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="mb-4">
            <ol className="flex items-center gap-2 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
              <li><Link href="/" className="hover:text-[var(--accent)]">Home</Link></li>
              <li>/</li>
              <li><Link href={`/${config.occasionSlug}`} className="hover:text-[var(--accent)]">{config.occasionLabel}</Link></li>
              <li>/</li>
              <li style={{ color: 'var(--text-tertiary)' }}>{config.tone}</li>
            </ol>
          </nav>

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

        <DeckBuilder />

        {/* Question list */}
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
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {q.text}
                  </p>
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
              More {config.occasionLabel}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/${config.occasionSlug}`}
                className="font-mono text-xs px-3 py-2 transition-colors duration-200"
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-secondary)',
                }}
              >
                All {config.occasionLabel}
              </Link>
              {OCCASIONS.find((o) => o.slug === config.occasionSlug)
                ?.tones.filter((t) => t !== config.tone)
                .map((t) => (
                  <Link
                    key={t}
                    href={`/${config.occasionSlug}/${t}`}
                    className="font-mono text-xs px-3 py-2 transition-colors duration-200"
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {t}
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
