import { useEffect } from 'react'

export default function Modal({ open, onClose, children, title }) {
  useEffect(() => {
    if (!open) return
    const handle = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-8 shadow-2xl"
        style={{ background: '#141E35', border: '1px solid #1C2B45' }}
      >
        {title && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold" style={{ color: 'rgba(255,255,255,0.92)' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-2xl leading-none hover:opacity-70 transition-opacity"
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              ×
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
