/**
 * prepare-questions.ts
 *
 * Transforms the unified_questions.json corpus into a filtered, tagged dataset
 * optimized for the Icebreaker Deck slot machine.
 *
 * Arc positions represent a conversation arc from light → deep → close:
 *   1: Break the Ice — funny, random, easy-going
 *   2: Get Curious — get-to-know, conversation starters
 *   3: Go Deeper — deep, reflective
 *   4: Turn Up the Heat — spicy, challenging, controversial
 *   5: Play a Round — binary format (WYR / this-or-that)
 *   6: End on a High — hopeful, dream, future-oriented
 *
 * Occasion filters:
 *   date_night: couples, dating audiences; allow flirty
 *   team: friends audience; exclude spicy, flirty
 *   family: family, kids audiences; exclude spicy, flirty, controversial
 *   party: funny tone; allow spicy
 *   all: no filter (default)
 *
 * Run: npx tsx scripts/prepare-questions.ts
 */

import * as fs from 'fs'
import * as path from 'path'

interface RawQuestion {
  id: string
  text: string
  slug: string
  option_a: string | null
  option_b: string | null
  format: string
  game_type: string | null
  category: string
  audiences: string[]
  tones: string[]
  occasions: string[]
  difficulty: string
  source: string
  source_url: string
  source_file: string
  source_section: string
  status: string
  verified: boolean
  created_at: string
}

interface ProcessedQuestion {
  id: string
  text: string
  slug: string
  optionA: string | null
  optionB: string | null
  format: string
  arcPosition: number
  arcLabel: string
  tones: string[]
  audiences: string[]
  category: string
  occasions: string[]
}

type ArcPosition = 1 | 2 | 3 | 4 | 5 | 6

const ARC_LABELS: Record<ArcPosition, string> = {
  1: 'Break the Ice',
  2: 'Get Curious',
  3: 'Go Deeper',
  4: 'Turn Up the Heat',
  5: 'Play a Round',
  6: 'End on a High',
}

// Keywords that signal hopeful/future-oriented questions (arc 6)
const HOPE_KEYWORDS = /\b(dream|hope|future|aspir|wish|bucket list|someday|imagine|legacy|one day|10 years|five years|retire|goal|inspire|grateful|thankful|appreciate|best thing|proud|accomplish|achieve)\b/i

// Keywords that signal light/fun questions (arc 1)
const FUN_KEYWORDS = /\b(embarrass|awkward|guilty pleasure|pet peeve|superpower|zombie|alien|funniest|weirdest|craziest|strangest|silliest|worst|dumbest)\b/i

function classifyArcPosition(q: RawQuestion): ArcPosition | null {
  const text = q.text.toLowerCase()
  const tones = new Set(q.tones)
  const audiences = new Set(q.audiences)

  // Arc 5: Binary format — WYR, this-or-that (most specific, check first)
  if (q.format === 'binary' && q.option_a && q.option_b) {
    return 5
  }

  // Arc 6: End on a High — hopeful/future-oriented
  if (HOPE_KEYWORDS.test(q.text)) {
    // Only if not also spicy/controversial
    if (!tones.has('spicy') && !tones.has('controversial')) {
      return 6
    }
  }

  // Arc 4: Turn Up the Heat — spicy, controversial, challenging
  if (tones.has('spicy') || tones.has('controversial')) {
    return 4
  }
  if (tones.has('challenging') && !tones.has('funny')) {
    return 4
  }

  // Arc 3: Go Deeper — deep, reflective
  if (tones.has('deep')) {
    return 3
  }
  if (q.category === 'self_reflection' || q.category === 'hypothetical') {
    return 3
  }

  // Arc 1: Break the Ice — funny, random, light
  if (tones.has('funny') || tones.has('random') || tones.has('weird')) {
    return 1
  }
  if (FUN_KEYWORDS.test(q.text)) {
    return 1
  }

  // Arc 2: Get Curious — get-to-know, conversation starters, general
  if (
    q.category === 'get_to_know' ||
    q.category === 'conversation_starters' ||
    q.category === 'icebreakers'
  ) {
    return 2
  }

  // Default: assign to Arc 2 (Get Curious) as the broadest bucket
  // Questions without strong tonal signals are good conversation starters
  return 2
}

function deriveOccasions(q: RawQuestion): string[] {
  const occasions: Set<string> = new Set()
  const tones = new Set(q.tones)
  const audiences = new Set(q.audiences)

  // Date Night: couples, dating audiences
  if (audiences.has('couples') || audiences.has('dating') || audiences.has('married')) {
    occasions.add('date_night')
  }
  if (tones.has('flirty')) {
    occasions.add('date_night')
  }

  // Team Offsite: friends audience, not spicy/flirty
  if (audiences.has('friends') || audiences.has('adults')) {
    if (!tones.has('spicy') && !tones.has('flirty') && !tones.has('controversial')) {
      occasions.add('team')
    }
  }

  // Family Dinner: family, kids audiences; not spicy/flirty/controversial
  if (audiences.has('family') || audiences.has('kids')) {
    if (!tones.has('spicy') && !tones.has('flirty') && !tones.has('controversial')) {
      occasions.add('family')
    }
  }

  // Party: funny tone, allow spicy
  if (tones.has('funny') || tones.has('random') || tones.has('weird')) {
    occasions.add('party')
  }
  if (tones.has('spicy') && tones.has('funny')) {
    occasions.add('party')
  }

  // Questions that fit general/all occasions (no audience restriction)
  // All questions without explicit exclusions are available under 'all'
  // (handled at query time, not stored)

  return Array.from(occasions)
}

function isQualityQuestion(q: RawQuestion): boolean {
  // Filter out trivia (not conversational)
  if (q.format === 'trivia') return false

  // Filter out very short questions (likely fragments)
  if (q.text.length < 15) return false

  // Filter out questions that don't end with ?
  if (!q.text.trim().endsWith('?')) return false

  // Filter out truth-or-dare dares (not question format)
  if (q.game_type === 'truth_or_dare' && !/\?/.test(q.text)) return false

  return true
}

function main() {
  const sourcePath = path.resolve(
    __dirname,
    '../../QuestionMonopoly/data/competitors/unified/unified_questions.json'
  )

  if (!fs.existsSync(sourcePath)) {
    console.error(`Source file not found: ${sourcePath}`)
    process.exit(1)
  }

  const raw: RawQuestion[] = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'))
  console.log(`Read ${raw.length} questions from corpus`)

  // Quality filter
  const quality = raw.filter(isQualityQuestion)
  console.log(`After quality filter: ${quality.length}`)

  // Deduplicate by normalized text
  const seen = new Set<string>()
  const unique = quality.filter((q) => {
    const normalized = q.text.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (seen.has(normalized)) return false
    seen.add(normalized)
    return true
  })
  console.log(`After dedup: ${unique.length}`)

  // Classify and transform
  const processed: ProcessedQuestion[] = []
  const arcCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }

  for (const q of unique) {
    const arc = classifyArcPosition(q)
    if (arc === null) continue

    arcCounts[arc]++

    processed.push({
      id: q.id,
      text: q.text,
      slug: q.slug,
      optionA: q.option_a,
      optionB: q.option_b,
      format: q.format,
      arcPosition: arc,
      arcLabel: ARC_LABELS[arc],
      tones: q.tones,
      audiences: q.audiences,
      category: q.category,
      occasions: deriveOccasions(q),
    })
  }

  console.log(`\nArc position distribution:`)
  for (const [arc, count] of Object.entries(arcCounts)) {
    const label = ARC_LABELS[parseInt(arc) as ArcPosition]
    console.log(`  ${arc}. ${label}: ${count}`)
  }
  console.log(`  Total: ${processed.length}`)

  // Occasion coverage
  const occasionCounts: Record<string, number> = {}
  for (const q of processed) {
    for (const occ of q.occasions) {
      occasionCounts[occ] = (occasionCounts[occ] || 0) + 1
    }
  }
  console.log(`\nOccasion coverage:`)
  for (const [occ, count] of Object.entries(occasionCounts)) {
    console.log(`  ${occ}: ${count}`)
  }

  // Write output
  const outPath = path.resolve(__dirname, '../data/questions.json')
  fs.writeFileSync(outPath, JSON.stringify(processed, null, 2))
  console.log(`\nWrote ${processed.length} questions to ${outPath}`)
}

main()
