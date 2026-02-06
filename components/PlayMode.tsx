'use client'

import { useState, useEffect, useCallback } from 'react'
import { type Deck } from '@/lib/decks'

interface PlayModeProps {
  deck: Deck
  onClose: () => void
}

export default function PlayMode({ deck, onClose }: PlayModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const total = deck.questions.length
  const question = deck.questions[currentIndex]

  const goNext = useCallback(() => {
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }, [currentIndex, total])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }, [currentIndex])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        goNext()
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      }
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev, onClose])

  if (!question) return null

  const isBinary = question.format === 'binary' && question.optionA && question.optionB

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <span
            className="font-mono text-xs uppercase tracking-widest"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {deck.name}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span
            className="font-mono text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            {currentIndex + 1} / {total}
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center transition-colors"
            style={{
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              color: 'var(--text-tertiary)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-6">
        <div
          className="h-0.5 w-full"
          style={{ background: 'var(--border)' }}
        >
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / total) * 100}%`,
              background: 'var(--accent)',
            }}
          />
        </div>
      </div>

      {/* Question display */}
      <div
        className="flex-1 flex items-center justify-center px-8 cursor-pointer"
        onClick={goNext}
      >
        <div className="max-w-2xl text-center">
          {/* Arc label */}
          <span
            className="font-mono text-xs uppercase tracking-widest mb-6 block"
            style={{ color: 'var(--text-muted)' }}
          >
            {question.arcLabel}
          </span>

          {/* Question text */}
          <h2
            className="font-display text-3xl sm:text-4xl md:text-5xl leading-tight mb-8"
            style={{ color: 'var(--text-primary)' }}
          >
            {question.text}
          </h2>

          {/* Binary options */}
          {isBinary && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <div
                className="px-6 py-4 text-base sm:text-lg"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {question.optionA}
              </div>
              <span
                className="font-mono text-sm flex items-center justify-center"
                style={{ color: 'var(--text-muted)' }}
              >
                or
              </span>
              <div
                className="px-6 py-4 text-base sm:text-lg"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {question.optionB}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-6 py-6">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="font-mono text-xs uppercase tracking-wider px-4 py-2 transition-all duration-200"
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: currentIndex === 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
            opacity: currentIndex === 0 ? 0.4 : 1,
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          Previous
        </button>

        <span
          className="font-mono text-xs hidden sm:block"
          style={{ color: 'var(--text-muted)' }}
        >
          Tap or press space to advance
        </span>

        {currentIndex < total - 1 ? (
          <button
            onClick={goNext}
            className="font-mono text-xs uppercase tracking-wider px-4 py-2 transition-all duration-200"
            style={{
              border: '1px solid var(--accent)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--bg-primary)',
              background: 'var(--accent)',
            }}
          >
            Next
          </button>
        ) : (
          <button
            onClick={onClose}
            className="font-mono text-xs uppercase tracking-wider px-4 py-2 transition-all duration-200"
            style={{
              border: '1px solid var(--accent)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--bg-primary)',
              background: 'var(--accent)',
            }}
          >
            Done
          </button>
        )}
      </div>
    </div>
  )
}
