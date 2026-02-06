import { MetadataRoute } from 'next'

const BASE_URL = 'https://icebreaker-deck.vercel.app'

const OCCASION_SLUGS = [
  'conversation-starters',
  'date-night-questions',
  'team-icebreakers',
  'family-dinner-questions',
  'party-questions',
]

const TONE_COMBOS: { occasion: string; tones: string[] }[] = [
  { occasion: 'conversation-starters', tones: ['deep', 'funny', 'spicy', 'random', 'challenging', 'weird'] },
  { occasion: 'date-night-questions', tones: ['deep', 'funny', 'spicy', 'flirty'] },
  { occasion: 'team-icebreakers', tones: ['funny', 'deep', 'random'] },
  { occasion: 'family-dinner-questions', tones: ['funny', 'deep', 'random'] },
  { occasion: 'party-questions', tones: ['funny', 'spicy', 'random', 'weird'] },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]

  // Occasion pages
  for (const slug of OCCASION_SLUGS) {
    routes.push({
      url: `${BASE_URL}/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    })
  }

  // Occasion + tone combo pages
  for (const combo of TONE_COMBOS) {
    for (const tone of combo.tones) {
      routes.push({
        url: `${BASE_URL}/${combo.occasion}/${tone}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  }

  return routes
}
