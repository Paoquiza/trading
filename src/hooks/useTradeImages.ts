import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { TradeImage } from '../lib/types'

export function useTradeImages(tradeId: string) {
  const { user } = useAuth()
  const [images, setImages] = useState<TradeImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const fetchImages = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('trade_images')
      .select('*')
      .eq('trade_id', tradeId)
      .order('created_at', { ascending: true })

    if (error) console.error('Error fetching images:', error)
    setImages((data as TradeImage[]) ?? [])
    setLoading(false)
  }, [tradeId])

  useEffect(() => { fetchImages() }, [fetchImages])

  const uploadImage = async (file: File) => {
    if (!user) return null
    setUploading(true)

    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const storagePath = `${user.id}/${tradeId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('trade-screenshots')
      .upload(storagePath, file)

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      setUploading(false)
      return null
    }

    const { data: urlData } = await supabase.storage
      .from('trade-screenshots')
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365) // 1 year

    const imageUrl = urlData?.signedUrl ?? ''

    const { data, error } = await supabase
      .from('trade_images')
      .insert({ trade_id: tradeId, image_url: imageUrl, storage_path: storagePath })
      .select()
      .single()

    if (error) console.error('Error saving image record:', error)
    setUploading(false)
    await fetchImages()
    return data as TradeImage | null
  }

  const deleteImage = async (image: TradeImage) => {
    const { error: storageError } = await supabase.storage
      .from('trade-screenshots')
      .remove([image.storage_path])

    if (storageError) console.error('Error deleting from storage:', storageError)

    const { error } = await supabase
      .from('trade_images')
      .delete()
      .eq('id', image.id)

    if (error) console.error('Error deleting image record:', error)
    await fetchImages()
  }

  const refreshUrls = useCallback(async () => {
    const updated = await Promise.all(
      images.map(async (img) => {
        const { data } = await supabase.storage
          .from('trade-screenshots')
          .createSignedUrl(img.storage_path, 60 * 60 * 24 * 365)
        return { ...img, image_url: data?.signedUrl ?? img.image_url }
      })
    )
    setImages(updated)
  }, [images])

  return { images, loading, uploading, uploadImage, deleteImage, refreshUrls }
}
