'use client'

import { Question } from '@/lib/questions'

interface QuestionCardProps {
  question: Question
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const isBinary = question.format === 'binary' && question.optionA && question.optionB

  return (
    <div className="p-3 sm:p-4 h-full flex flex-col justify-between">
      {/* Question text */}
      <div className="flex-1 flex items-center">
        <p
          className="text-sm sm:text-base font-medium leading-snug"
          style={{
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {question.text}
        </p>
      </div>

      {/* Binary options (WYR / this-or-that) */}
      {isBinary && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex gap-2">
            <span
              className="flex-1 text-xs px-2 py-1.5 text-center"
              style={{
                background: 'var(--bg-inset)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {question.optionA}
            </span>
            <span
              className="text-xs flex items-center"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              or
            </span>
            <span
              className="flex-1 text-xs px-2 py-1.5 text-center"
              style={{
                background: 'var(--bg-inset)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {question.optionB}
            </span>
          </div>
        </div>
      )}

      {/* Tone badge */}
      {question.tones.length > 0 && (
        <div className="mt-2 flex gap-1 flex-wrap">
          {question.tones.slice(0, 2).map((tone) => (
            <span
              key={tone}
              className="font-mono px-1.5 py-0.5"
              style={{
                fontSize: '0.6rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-inset)',
                borderRadius: 'var(--radius-sm)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {tone}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
