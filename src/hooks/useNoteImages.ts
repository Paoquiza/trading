import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { NoteImage } from '../lib/types'

export function useNoteImages(noteId: string | null, date: string) {
  const { user } = useAuth()
  const [images, setImages] = useState<NoteImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const fetchImages = useCallback(async (id?: string) => {
    const resolvedId = id ?? noteId
    if (!resolvedId) {
      setImages([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('note_images')
      .select('*')
      .eq('note_id', resolvedId)
      .order('created_at', { ascending: true })

    if (error) console.error('Error fetching note images:', error)
    setImages((data as NoteImage[]) ?? [])
    setLoading(false)
  }, [noteId])

  useEffect(() => { fetchImages() }, [fetchImages])

  const uploadImage = async (file: File, overrideNoteId?: string) => {
    const resolvedNoteId = overrideNoteId ?? noteId
    if (!user || !resolvedNoteId) return null
    setUploading(true)

    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const storagePath = `${user.id}/notes/${date}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('trade-screenshots')
      .upload(storagePath, file)

    if (uploadError) {
      console.error('Error uploading note image:', uploadError)
      setUploading(false)
      return null
    }

    const { data: urlData } = await supabase.storage
      .from('trade-screenshots')
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365)

    const imageUrl = urlData?.signedUrl ?? ''

    const { data, error } = await supabase
      .from('note_images')
      .insert({ note_id: resolvedNoteId, image_url: imageUrl, storage_path: storagePath })
      .select()
      .single()

    if (error) console.error('Error saving note image record:', error)
    setUploading(false)
    await fetchImages(resolvedNoteId)
    return data as NoteImage | null
  }

  const deleteImage = async (image: NoteImage) => {
    const { error: storageError } = await supabase.storage
      .from('trade-screenshots')
      .remove([image.storage_path])

    if (storageError) console.error('Error deleting from storage:', storageError)

    const { error } = await supabase
      .from('note_images')
      .delete()
      .eq('id', image.id)

    if (error) console.error('Error deleting note image record:', error)
    await fetchImages()
  }

  return { images, loading, uploading, uploadImage, deleteImage }
}
