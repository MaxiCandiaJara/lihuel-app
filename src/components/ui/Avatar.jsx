import clsx from 'clsx'

const Avatar = ({ name = '', size = 'md', className }) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  const colors = [
    'bg-primary-700 text-white',
    'bg-accent-DEFAULT text-white',
    'bg-success/30 text-success',
    'bg-warning/30 text-warning',
    'bg-danger/30 text-danger',
  ]
  const color = colors[(name.charCodeAt(0) || 0) % colors.length]

  const sizeClass = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  }[size]

  return (
    <div
      className={clsx(
        'rounded-full flex items-center justify-center font-bold shrink-0',
        sizeClass, color, className
      )}
      title={name}
    >
      {initials || '?'}
    </div>
  )
}

export default Avatar
