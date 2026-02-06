'use client'

interface LockToggleProps {
  isLocked: boolean
  onToggle: () => void
  disabled?: boolean
}

export default function LockToggle({ isLocked, onToggle, disabled }: LockToggleProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className="transition-all duration-200"
      style={{
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-sm)',
        background: isLocked ? 'var(--text-primary)' : 'transparent',
        border: isLocked ? 'none' : '1px solid var(--border)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
      }}
      title={isLocked ? 'Unlock this slot' : 'Lock this question'}
    >
      {isLocked ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--bg-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 019.9-1" />
        </svg>
      )}
    </button>
  )
}
