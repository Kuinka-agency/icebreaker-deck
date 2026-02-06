'use client'

import { useState, useEffect } from 'react'
import { getDecks, deleteDeck, type Deck } from '@/lib/decks'

interface SavedDecksProps {
  onPlay: (deck: Deck) => void
}

export default function SavedDecks({ onPlay }: SavedDecksProps) {
  const [decks, setDecks] = useState<Deck[]>([])

  useEffect(() => {
    setDecks(getDecks())
  }, [])

  const handleDelete = (id: string) => {
    deleteDeck(id)
    setDecks(getDecks())
  }

  if (decks.length === 0) {
    return (
      <p
        className="text-sm font-body"
        style={{ color: 'var(--text-muted)' }}
      >
        No saved decks yet. Spin some questions and save your favorites.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {decks.map((deck) => (
        <div
          key={deck.id}
          className="p-4 transition-all duration-200"
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <h3
              className="font-body text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              {deck.name}
            </h3>
            <span
              className="font-mono text-xs"
              style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}
            >
              {deck.questions.length}q
            </span>
          </div>

          <p
            className="font-mono text-xs mb-3"
            style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem' }}
          >
            {deck.occasion !== 'all' ? deck.occasion.replace('_', ' ') : 'General'}
            {' · '}
            {new Date(deck.createdAt).toLocaleDateString()}
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => onPlay(deck)}
              className="font-mono text-xs uppercase tracking-wider px-3 py-1.5 transition-all duration-200"
              style={{
                border: '1px solid var(--accent)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--accent)',
                background: 'transparent',
              }}
            >
              Play
            </button>
            <button
              onClick={() => handleDelete(deck.id)}
              className="font-mono text-xs uppercase tracking-wider px-3 py-1.5 transition-all duration-200"
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)',
                background: 'transparent',
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
