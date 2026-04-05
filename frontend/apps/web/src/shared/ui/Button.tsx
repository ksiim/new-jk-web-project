import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
}

export function Button({ variant = 'primary', style, ...props }: Props) {
  const base: React.CSSProperties = {
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid transparent',
    cursor: 'pointer',
    fontWeight: 600,
  }

  const variants: Record<NonNullable<Props['variant']>, React.CSSProperties> = {
    primary: { background: '#111827', color: '#ffffff' },
    secondary: { background: '#ffffff', color: '#111827', borderColor: '#e5e7eb' },
  }

  return <button {...props} style={{ ...base, ...variants[variant], ...style }} />
}

