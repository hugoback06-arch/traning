import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-accent text-accent-foreground disabled:opacity-60',
  secondary: 'bg-surface-muted text-ink-primary border border-border',
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`press rounded-lg px-3 py-2 text-sm font-medium ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  )
}
