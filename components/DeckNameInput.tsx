'use client'

interface DeckNameInputProps {
  value: string
  onChange: (value: string) => void
}

export default function DeckNameInput({ value, onChange }: DeckNameInputProps) {
  return (
    <div className="flex-1">
      <label
        className="font-mono text-xs uppercase tracking-widest mb-2 block"
        style={{ color: 'var(--text-tertiary)' }}
      >
        Deck Name
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Friday Dinner Questions"
        className="w-full font-body text-sm px-4 py-2.5 transition-all duration-200 outline-none"
        style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
        }}
      />
    </div>
  )
}
