import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { ImageLightbox } from './ImageLightbox'

interface GalleryImage {
  id: string
  image_url: string
}

interface ImageGalleryProps<T extends GalleryImage> {
  images: T[]
  onDelete?: (image: T) => void
}

export function ImageGallery<T extends GalleryImage>({ images, onDelete }: ImageGalleryProps<T>) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (images.length === 0) {
    return <p className="text-dark-400 text-sm">No screenshots yet.</p>
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((img, i) => (
          <div key={img.id} className="relative group">
            <img
              src={img.image_url}
              alt="Trade screenshot"
              className="w-full h-40 object-cover rounded-lg cursor-pointer border border-dark-600 hover:border-dark-400 transition-colors"
              onClick={() => setLightboxIndex(i)}
            />
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(img) }}
                className="absolute top-2 right-2 p-1.5 bg-dark-900/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  )
}
