'use client'

import { useState, useEffect, useCallback } from 'react'
import { Question, ArcSlot, Occasion } from '@/lib/questions'
import QuestionSlot from './QuestionSlot'
import SpinButton from './SpinButton'
import OccasionFilter from './OccasionFilter'
import DeckNameInput from './DeckNameInput'
import SavedDecks from './SavedDecks'
import PlayMode from './PlayMode'
import { saveDeck, type Deck } from '@/lib/decks'

interface SpinResponse {
  questions: Record<string, Question>
  arcSlots: ArcSlot[]
}

export default function DeckBuilder() {
  const [questions, setQuestions] = useState<Record<string, Question>>({})
  const [arcSlots, setArcSlots] = useState<ArcSlot[]>([])
  const [locked, setLocked] = useState<Record<string, string>>({})
  const [isSpinning, setIsSpinning] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [spinCount, setSpinCount] = useState(0)
  const [occasion, setOccasion] = useState<Occasion>('all')
  const [deckName, setDeckName] = useState('')
  const [showSaved, setShowSaved] = useState(false)
  const [playDeck, setPlayDeck] = useState<Deck | null>(null)
  const [saveMessage, setSaveMessage] = useState('')

  const spin = useCallback(async () => {
    setIsSpinning(true)

    const lockedParam = Object.entries(locked)
      .map(([arc, id]) => `${arc}:${id}`)
      .join(',')

    const params = new URLSearchParams()
    if (lockedParam) params.set('locked', lockedParam)
    if (occasion !== 'all') params.set('occasion', occasion)

    const url = `/api/spin${params.toString() ? `?${params}` : ''}`

    try {
      const res = await fetch(url)
      const data: SpinResponse = await res.json()

      setTimeout(() => {
        setQuestions(data.questions)
        setArcSlots(data.arcSlots)
        setIsSpinning(false)
        setIsLoaded(true)
        setSpinCount((prev) => prev + 1)
      }, 400)
    } catch (error) {
      console.error('Spin failed:', error)
      setIsSpinning(false)
    }
  }, [locked, occasion])

  useEffect(() => {
    spin()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleLock = (arcPosition: string) => {
    const question = questions[arcPosition]
    if (!question) return

    setLocked((prev) => {
      if (prev[arcPosition]) {
        const { [arcPosition]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [arcPosition]: question.id }
    })
  }

  const handleOccasionChange = (newOccasion: Occasion) => {
    setOccasion(newOccasion)
    // Clear locks when changing occasion (pool changes)
    setLocked({})
  }

  const handleSaveDeck = () => {
    const questionList = arcSlots.map((slot) => questions[String(slot.position)]).filter(Boolean)
    if (questionList.length === 0) return

    const deck: Deck = {
      id: Date.now().toString(36),
      name: deckName || `Deck #${spinCount}`,
      occasion,
      questions: questionList,
      createdAt: new Date().toISOString(),
    }

    saveDeck(deck)
    setSaveMessage(`Saved "${deck.name}"`)
    setTimeout(() => setSaveMessage(''), 2000)
  }

  const handlePlayCurrent = () => {
    const questionList = arcSlots.map((slot) => questions[String(slot.position)]).filter(Boolean)
    if (questionList.length === 0) return

    setPlayDeck({
      id: 'current',
      name: deckName || 'Current Spin',
      occasion,
      questions: questionList,
      createdAt: new Date().toISOString(),
    })
  }

  const lockedCount = Object.keys(locked).length

  return (
    <>
      <div className="max-w-6xl mx-auto">
        {/* Occasion filter */}
        <div className="mb-6 reveal-up delay-3">
          <div className="flex items-center gap-3 mb-3">
            <span
              className="font-mono text-xs tracking-widest uppercase"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Occasion
            </span>
          </div>
          <OccasionFilter
            selected={occasion}
            onChange={handleOccasionChange}
            disabled={isSpinning}
          />
        </div>

        {/* Section label */}
        <div className="flex items-center justify-between mb-4 reveal-up delay-3">
          <span
            className="font-mono text-xs tracking-widest uppercase"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Your Deck
          </span>
          {isLoaded && (
            <span
              className="font-mono text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              {lockedCount > 0 ? (
                <>{lockedCount} locked</>
              ) : (
                <>Spin #{spinCount}</>
              )}
            </span>
          )}
        </div>

        {/* Slots Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8 reveal-scale delay-4">
          {arcSlots.map((slot, index) => (
            <QuestionSlot
              key={slot.position}
              arcSlot={slot}
              question={questions[String(slot.position)] || null}
              isLocked={!!locked[String(slot.position)]}
              isSpinning={isSpinning}
              animationDelay={index * 80}
              onToggleLock={() => toggleLock(String(slot.position))}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4 reveal-up delay-5">
          <SpinButton onClick={spin} isSpinning={isSpinning} />

          {isLoaded && lockedCount === 0 && (
            <p
              className="text-sm"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Lock questions you like to keep them on re-spin
            </p>
          )}
        </div>

        {/* Deck save controls */}
        {isLoaded && (
          <div className="mt-10 reveal-up delay-6">
            <hr className="rams-divider mb-6" />
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <DeckNameInput value={deckName} onChange={setDeckName} />
              <div className="flex gap-3">
                <button
                  onClick={handleSaveDeck}
                  className="font-mono text-xs uppercase tracking-wider px-6 py-2.5 transition-all duration-200"
                  style={{
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-card)',
                  }}
                >
                  Save Deck
                </button>
                <button
                  onClick={handlePlayCurrent}
                  className="font-mono text-xs uppercase tracking-wider px-6 py-2.5 transition-all duration-200"
                  style={{
                    border: '1px solid var(--accent)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--bg-primary)',
                    background: 'var(--accent)',
                  }}
                >
                  Play
                </button>
              </div>
            </div>
            {saveMessage && (
              <p
                className="mt-2 font-mono text-xs"
                style={{ color: 'var(--accent)' }}
              >
                {saveMessage}
              </p>
            )}
          </div>
        )}

        {/* Saved decks section */}
        {isLoaded && (
          <div className="mt-8">
            <button
              onClick={() => setShowSaved(!showSaved)}
              className="font-mono text-xs uppercase tracking-widest mb-4 transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {showSaved ? 'Hide' : 'Show'} Saved Decks
            </button>
            {showSaved && (
              <SavedDecks onPlay={(deck) => setPlayDeck(deck)} />
            )}
          </div>
        )}
      </div>

      {/* Play mode overlay */}
      {playDeck && (
        <PlayMode deck={playDeck} onClose={() => setPlayDeck(null)} />
      )}
    </>
  )
}
