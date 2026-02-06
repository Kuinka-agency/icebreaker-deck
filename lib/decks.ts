import { Question, Occasion } from './questions'

export interface Deck {
  id: string
  name: string
  occasion: Occasion
  questions: Question[]
  createdAt: string
}

const STORAGE_KEY = 'icebreaker-decks'

export function getDecks(): Deck[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveDeck(deck: Deck): void {
  const decks = getDecks()
  decks.unshift(deck)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks))
}

export function deleteDeck(id: string): void {
  const decks = getDecks().filter((d) => d.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks))
}
