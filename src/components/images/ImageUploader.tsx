import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'

interface ImageUploaderProps {
  onUpload: (file: File) => Promise<unknown>
  uploading: boolean
}

export function ImageUploader({ onUpload, uploading }: ImageUploaderProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      await onUpload(file)
    }
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    disabled: uploading,
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-accent-400 bg-accent-500/5' : 'border-dark-500 hover:border-dark-400'
      } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />
      <Upload size={24} className="mx-auto mb-2 text-dark-300" />
      {uploading ? (
        <p className="text-dark-300 text-sm">Uploading...</p>
      ) : isDragActive ? (
        <p className="text-accent-400 text-sm">Drop images here</p>
      ) : (
        <p className="text-dark-300 text-sm">Drag & drop screenshots here, or click to select</p>
      )}
    </div>
  )
}
