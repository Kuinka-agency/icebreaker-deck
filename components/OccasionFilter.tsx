'use client'

import { type Occasion } from '@/lib/questions'

const OCCASIONS: { value: Occasion; label: string; emoji: string }[] = [
  { value: 'all', label: 'All', emoji: '' },
  { value: 'date_night', label: 'Date Night', emoji: '' },
  { value: 'team', label: 'Team Offsite', emoji: '' },
  { value: 'family', label: 'Family Dinner', emoji: '' },
  { value: 'party', label: 'Party', emoji: '' },
]

interface OccasionFilterProps {
  selected: Occasion
  onChange: (occasion: Occasion) => void
  disabled?: boolean
}

export default function OccasionFilter({ selected, onChange, disabled }: OccasionFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {OCCASIONS.map((occ) => (
        <button
          key={occ.value}
          onClick={() => onChange(occ.value)}
          disabled={disabled}
          className={`occasion-pill font-mono text-xs uppercase tracking-wider px-4 py-2 ${
            selected === occ.value ? 'active' : ''
          }`}
          style={{
            borderRadius: 'var(--radius-sm)',
            border:
              selected === occ.value
                ? '1px solid var(--accent)'
                : '1px solid var(--border)',
            background:
              selected === occ.value ? 'var(--accent)' : 'transparent',
            color:
              selected === occ.value
                ? 'var(--bg-primary)'
                : 'var(--text-tertiary)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {occ.label}
        </button>
      ))}
    </div>
  )
}
