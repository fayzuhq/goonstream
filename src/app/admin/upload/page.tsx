'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function UploadPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [channelId, setChannelId] = useState('')
  const [channels, setChannels] = useState<{id: string, name: string}[]>([])
  const [tags, setTags] = useState<{id: string, name: string}[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: channelsData } = await supabase.from('channels').select('id, name')
      if (channelsData) setChannels(channelsData)

      const { data: tagsData } = await supabase.from('tags').select('id, name')
      if (tagsData) setTags(tagsData)
    }
    fetchData()
  }, [])

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnailFile(file)
      setThumbnailPreview(URL.createObjectURL(file))
    }
  }

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Normalement ici il y aurait la logique d'upload vers Supabase Storage,
    // puis l'insertion dans public.videos
    alert("Fonctionnalité d'upload simulée")
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/dashboard"
          className="p-2 bg-[var(--surface)] border border-[var(--surface-border)] rounded-lg hover:bg-white/10 transition-colors"
        >
          &larr; Retour
        </Link>
        <h1 className="text-3xl font-black text-gradient-signature">Module Upload</h1>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titre et Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--muted)]">Titre de la vidéo</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 bg-black/50 border border-[var(--surface-border)] rounded-xl focus:outline-none focus:border-[#ff3366] transition-colors"
                placeholder="Ex: Titre incroyable"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--muted)]">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-black/50 border border-[var(--surface-border)] rounded-xl focus:outline-none focus:border-[#ff3366] transition-colors min-h-[100px]"
                placeholder="Description de la vidéo..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fichiers */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--muted)]">Fichier Vidéo (.mp4, .webm)</label>
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="w-full p-2 bg-black/50 border border-[var(--surface-border)] rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--muted)]">Miniature (.jpg, .png, .webp)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleThumbnailChange}
                  className="w-full p-2 bg-black/50 border border-[var(--surface-border)] rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                  required
                />
              </div>

              {thumbnailPreview && (
                <div className="mt-4 rounded-xl overflow-hidden border border-[var(--surface-border)] aspect-video relative bg-black/50">
                  <img src={thumbnailPreview} alt="Aperçu miniature" className="object-cover w-full h-full" />
                </div>
              )}
            </div>

            {/* Relations */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--muted)]">Chaîne</label>
                <select
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  className="w-full p-3 bg-black/50 border border-[var(--surface-border)] rounded-xl focus:outline-none focus:border-[#ff3366] transition-colors appearance-none"
                  required
                >
                  <option value="">Sélectionner une chaîne...</option>
                  {channels.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--muted)]">Tags (Optionnel)</label>
                <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-3 bg-black/50 border border-[var(--surface-border)] rounded-xl">
                  {tags.map(tag => (
                    <button
                      type="button"
                      key={tag.id}
                      onClick={() => handleTagToggle(tag.id)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        selectedTags.includes(tag.id)
                          ? 'bg-[#ff3366]/20 border-[#ff3366] text-white'
                          : 'bg-white/5 border-[var(--surface-border)] text-[var(--muted)] hover:bg-white/10'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                  {tags.length === 0 && <span className="text-xs text-[var(--muted)]">Aucun tag disponible</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[var(--surface-border)]">
            <button
              type="submit"
              className="w-full py-4 bg-gradient-signature rounded-xl font-bold text-white hover:opacity-90 transition-opacity"
            >
              Publier la vidéo
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
