import questionsData from '@/data/questions.json'

export interface Question {
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

export interface ArcSlot {
  position: number
  label: string
  color: string
}

export type Occasion = 'all' | 'date_night' | 'team' | 'family' | 'party'

const ARC_SLOTS: ArcSlot[] = [
  { position: 1, label: 'Break the Ice', color: 'var(--arc-1)' },
  { position: 2, label: 'Get Curious', color: 'var(--arc-2)' },
  { position: 3, label: 'Go Deeper', color: 'var(--arc-3)' },
  { position: 4, label: 'Turn Up the Heat', color: 'var(--arc-4)' },
  { position: 5, label: 'Play a Round', color: 'var(--arc-5)' },
  { position: 6, label: 'End on a High', color: 'var(--arc-6)' },
]

// Occasion filter rules — exclude tones/audiences that don't fit
const OCCASION_EXCLUDES: Record<Occasion, { tones: string[]; audiences?: string[] }> = {
  all: { tones: [] },
  date_night: { tones: [] }, // inclusive — allow flirty, spicy for couples
  team: { tones: ['spicy', 'flirty', 'controversial'] },
  family: { tones: ['spicy', 'flirty', 'controversial'] },
  party: { tones: [] }, // inclusive — allow everything fun
}

// Occasion prefer rules — boost questions tagged for this occasion
const OCCASION_PREFER: Record<Occasion, { audiences: string[] }> = {
  all: { audiences: [] },
  date_night: { audiences: ['couples', 'dating', 'married'] },
  team: { audiences: ['friends', 'adults'] },
  family: { audiences: ['family', 'kids'] },
  party: { audiences: [] },
}

// Parse all questions at module load
const allQuestions: Question[] = (questionsData as any[]).map((q) => ({
  id: q.id,
  text: q.text,
  slug: q.slug,
  optionA: q.optionA,
  optionB: q.optionB,
  format: q.format,
  arcPosition: q.arcPosition,
  arcLabel: q.arcLabel,
  tones: q.tones,
  audiences: q.audiences,
  category: q.category,
  occasions: q.occasions,
}))

// Index by arc position
const questionsByArc: Record<number, Question[]> = {}
for (const q of allQuestions) {
  if (!questionsByArc[q.arcPosition]) {
    questionsByArc[q.arcPosition] = []
  }
  questionsByArc[q.arcPosition].push(q)
}

const questionsById: Record<string, Question> = {}
for (const q of allQuestions) {
  questionsById[q.id] = q
}

export function getArcSlots(): ArcSlot[] {
  return ARC_SLOTS
}

export function getAllQuestions(): Question[] {
  return allQuestions
}

export function getQuestionById(id: string): Question | null {
  return questionsById[id] || null
}

export function getQuestionsByArc(arcPosition: number): Question[] {
  return questionsByArc[arcPosition] || []
}

function filterByOccasion(questions: Question[], occasion: Occasion): Question[] {
  if (occasion === 'all') return questions

  const excludes = OCCASION_EXCLUDES[occasion]
  const prefers = OCCASION_PREFER[occasion]

  let filtered = questions

  // Exclude inappropriate tones
  if (excludes.tones.length > 0) {
    filtered = filtered.filter(
      (q) => !q.tones.some((t) => excludes.tones.includes(t))
    )
  }

  // If the occasion has preferred audiences, prioritize them
  // But don't exclude questions without audience tags (they're general)
  if (prefers.audiences.length > 0) {
    const preferred = filtered.filter(
      (q) =>
        q.audiences.length === 0 ||
        q.audiences.some((a) => prefers.audiences.includes(a))
    )
    // Use preferred if enough exist, otherwise fall back to filtered
    if (preferred.length >= 50) {
      filtered = preferred
    }
  }

  return filtered
}

export function getRandomQuestion(
  arcPosition: number,
  occasion: Occasion = 'all',
  excludeIds: string[] = []
): Question | null {
  const pool = filterByOccasion(questionsByArc[arcPosition] || [], occasion)
  const available = pool.filter((q) => !excludeIds.includes(q.id))

  if (available.length === 0) return null

  // Equal-weight random (no popularity bias)
  const index = Math.floor(Math.random() * available.length)
  return available[index]
}

export interface SpinResult {
  [arcPosition: string]: Question
}

export function spinQuestions(
  locked: Record<string, string> = {},
  occasion: Occasion = 'all'
): SpinResult {
  const slots = getArcSlots()
  const result: SpinResult = {}

  for (const slot of slots) {
    const key = String(slot.position)

    if (locked[key]) {
      const question = getQuestionById(locked[key])
      if (question) {
        result[key] = question
        continue
      }
    }

    const question = getRandomQuestion(slot.position, occasion)
    if (question) {
      result[key] = question
    }
  }

  return result
}

// For pSEO: get questions filtered by occasion and/or tone
export function getFilteredQuestions(options: {
  occasion?: Occasion
  tone?: string
  limit?: number
}): Question[] {
  let pool = allQuestions

  if (options.occasion && options.occasion !== 'all') {
    pool = filterByOccasion(pool, options.occasion)
  }

  if (options.tone) {
    pool = pool.filter((q) => q.tones.includes(options.tone!))
  }

  if (options.limit) {
    pool = pool.slice(0, options.limit)
  }

  return pool
}
