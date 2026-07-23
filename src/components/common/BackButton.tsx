import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router'

interface BackButtonProps {
  onClick?: () => void
  to?: string
  label?: string
  className?: string
}

export function BackButton({ onClick, to, label = 'Tillbaka', className }: BackButtonProps) {
  const content = (
    <>
      <ChevronLeft size={16} />
      {label}
    </>
  )
  const classes = `flex items-center gap-0.5 text-sm text-ink-secondary ${className ?? ''}`

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={classes}>
      {content}
    </button>
  )
}
