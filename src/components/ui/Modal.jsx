import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size     = 'md',
  bottomSheet = false,
}) => {
  const overlayRef = useRef(null)

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else        document.body.style.overflow = ''
    return ()   => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!isOpen) return null

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[size]

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div
        className={clsx(
          'relative z-10 w-full bg-card border border-border shadow-2xl',
          bottomSheet
            ? 'rounded-t-3xl animate-slide-up'
            : `rounded-2xl mx-4 ${sizeClass} animate-fade-in`,
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-textPrimary">{title}</h2>
          <button
            onClick={onClose}
            className="btn-ghost p-2 rounded-xl"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[70vh] p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
