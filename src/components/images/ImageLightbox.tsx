import { useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { TradeImage } from '../../lib/types'

interface ImageLightboxProps {
  images: TradeImage[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export function ImageLightbox({ images, currentIndex, onClose, onNavigate }: ImageLightboxProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1)
      if (e.key === 'ArrowRight' && currentIndex < images.length - 1) onNavigate(currentIndex + 1)
    }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [currentIndex, images.length, onClose, onNavigate])

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white cursor-pointer">
        <X size={28} />
      </button>

      {currentIndex > 0 && (
        <button
          onClick={() => onNavigate(currentIndex - 1)}
          className="absolute left-4 text-white/70 hover:text-white cursor-pointer"
        >
          <ChevronLeft size={36} />
        </button>
      )}

      <img
        src={images[currentIndex].image_url}
        alt="Trade screenshot"
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
      />

      {currentIndex < images.length - 1 && (
        <button
          onClick={() => onNavigate(currentIndex + 1)}
          className="absolute right-4 text-white/70 hover:text-white cursor-pointer"
        >
          <ChevronRight size={36} />
        </button>
      )}

      <p className="absolute bottom-4 text-white/50 text-sm">
        {currentIndex + 1} / {images.length}
      </p>
    </div>
  )
}
