'use client'

import { Question, ArcSlot } from '@/lib/questions'
import QuestionCard from './QuestionCard'
import LockToggle from './LockToggle'

// SVG icon paths for each arc position
const ARC_ICONS: Record<number, string> = {
  1: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z', // checkmark circle — ice
  2: 'M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z', // question mark
  3: 'M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z', // compass/direction
  4: 'M13.5 0.67s0.74 2.65 0.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z', // flame
  5: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z', // chart/game
  6: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z', // star
}

interface QuestionSlotProps {
  arcSlot: ArcSlot
  question: Question | null
  isLocked: boolean
  isSpinning: boolean
  animationDelay: number
  onToggleLock: () => void
}

export default function QuestionSlot({
  arcSlot,
  question,
  isLocked,
  isSpinning,
  animationDelay,
  onToggleLock,
}: QuestionSlotProps) {
  const iconPath = ARC_ICONS[arcSlot.position] || ''

  return (
    <div className="flex flex-col group">
      {/* Arc position header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          {iconPath && (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ color: arcSlot.color }}
            >
              <path d={iconPath} />
            </svg>
          )}
          <span
            className="font-mono text-xs uppercase tracking-wider"
            style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem' }}
          >
            {arcSlot.label}
          </span>
        </div>
        <LockToggle
          isLocked={isLocked}
          onToggle={onToggleLock}
          disabled={isSpinning}
        />
      </div>

      {/* Question card container */}
      <div
        className="relative overflow-hidden transition-all duration-300 flex-1"
        style={{
          borderRadius: 'var(--radius-md)',
          border: isLocked
            ? `2px solid ${arcSlot.color}`
            : '1px solid var(--border)',
          background: 'var(--bg-card)',
          minHeight: '160px',
        }}
      >
        {/* Arc color accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: arcSlot.color }}
        />

        {question ? (
          <div
            className={isSpinning && !isLocked ? 'animate-slot-spin' : ''}
            style={{ animationDelay: `${animationDelay}ms` }}
          >
            <QuestionCard question={question} />
          </div>
        ) : (
          <div
            className="h-full min-h-[160px] flex items-center justify-center"
            style={{ background: 'var(--bg-inset)' }}
          >
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              style={{ color: 'var(--text-muted)' }}
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
