'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function GestionPage() {
  const [activeTab, setActiveTab] = useState<'accueil' | 'chaines' | 'tags'>('accueil')
  const [featuredVideos, setFeaturedVideos] = useState<any[]>([])
  const [channels, setChannels] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    if (activeTab === 'accueil') {
      const { data } = await supabase.from('videos').select('*').eq('is_featured_home', true).limit(10)
      if (data) setFeaturedVideos(data)
    } else if (activeTab === 'chaines') {
      const { data } = await supabase.from('channels').select('*')
      if (data) setChannels(data)
    } else if (activeTab === 'tags') {
      const { data } = await supabase.from('tags').select('*')
      if (data) setTags(data)
    }
  }

  const handleDeleteChannel = async (id: string) => {
    await supabase.from('channels').delete().eq('id', id)
    fetchData()
  }

  const handleDeleteTag = async (id: string) => {
    await supabase.from('tags').delete().eq('id', id)
    fetchData()
  }

  const [newTagName, setNewTagName] = useState('')
  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTagName) return
    const slug = newTagName.toLowerCase().replace(/ /g, '-')
    await supabase.from('tags').insert([{ name: newTagName, slug }])
    setNewTagName('')
    fetchData()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/dashboard"
          className="p-2 bg-[var(--surface)] border border-[var(--surface-border)] rounded-lg hover:bg-white/10 transition-colors"
        >
          &larr; Retour
        </Link>
        <h1 className="text-3xl font-black text-gradient-signature">Module Gestion</h1>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-2xl overflow-hidden mb-8">
        <div className="flex border-b border-[var(--surface-border)]">
          <button
            className={`flex-1 py-4 text-center font-bold transition-colors ${activeTab === 'accueil' ? 'bg-white/10 border-b-2 border-[#ff3366]' : 'hover:bg-white/5'}`}
            onClick={() => setActiveTab('accueil')}
          >
            Accueil (Vidéos Épinglées)
          </button>
          <button
            className={`flex-1 py-4 text-center font-bold transition-colors ${activeTab === 'chaines' ? 'bg-white/10 border-b-2 border-[#ff3366]' : 'hover:bg-white/5'}`}
            onClick={() => setActiveTab('chaines')}
          >
            Chaînes
          </button>
          <button
            className={`flex-1 py-4 text-center font-bold transition-colors ${activeTab === 'tags' ? 'bg-white/10 border-b-2 border-[#ff3366]' : 'hover:bg-white/5'}`}
            onClick={() => setActiveTab('tags')}
          >
            Tags / Catégories
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'accueil' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Vidéos épinglées en page d&apos;accueil (Max 10)</h2>
              <div className="space-y-4">
                {featuredVideos.length === 0 ? (
                  <p className="text-[var(--muted)] text-sm">Aucune vidéo épinglée actuellement.</p>
                ) : (
                  featuredVideos.map(video => (
                    <div key={video.id} className="flex items-center justify-between p-4 bg-black/50 border border-[var(--surface-border)] rounded-xl">
                      <div className="flex items-center gap-4">
                        <img src={video.thumbnail_url} alt={video.title} className="w-24 h-14 object-cover rounded" />
                        <div>
                          <p className="font-bold text-sm">{video.title}</p>
                          <p className="text-xs text-[var(--muted)]">Vues : {video.views_fake}</p>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-red-500/20 text-red-500 rounded border border-red-500/50 hover:bg-red-500/30 text-xs font-bold">
                        Détacher
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'chaines' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Gestion des Chaînes</h2>
                <button className="px-4 py-2 bg-gradient-signature rounded-lg font-bold text-sm hover:opacity-90">
                  + Nouvelle Chaîne
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {channels.length === 0 ? (
                  <p className="text-[var(--muted)] text-sm">Aucune chaîne trouvée.</p>
                ) : (
                  channels.map(channel => (
                    <div key={channel.id} className="p-4 bg-black/50 border border-[var(--surface-border)] rounded-xl flex items-center gap-4">
                      {channel.avatar_url ? (
                         <img src={channel.avatar_url} alt={channel.name} className="w-12 h-12 rounded-full object-cover bg-white/10" />
                      ) : (
                         <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-bold">{channel.name[0]}</div>
                      )}
                      <div className="flex-1">
                        <p className="font-bold">{channel.name}</p>
                        <p className="text-xs text-[var(--muted)]">/{channel.slug}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-sm px-2 py-1 bg-white/10 rounded hover:bg-white/20">Éditer</button>
                        <button onClick={() => handleDeleteChannel(channel.id)} className="text-sm px-2 py-1 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30">Suppr.</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'tags' && (
            <div>
              <h2 className="text-xl font-bold mb-6">Gestion des Tags / Catégories</h2>

              <form onSubmit={handleAddTag} className="flex gap-4 mb-8">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Nom du nouveau tag..."
                  className="flex-1 p-3 bg-black/50 border border-[var(--surface-border)] rounded-xl focus:outline-none focus:border-[#ff3366] transition-colors"
                  required
                />
                <button type="submit" className="px-6 py-3 bg-gradient-signature rounded-xl font-bold text-white hover:opacity-90">
                  Ajouter rapide
                </button>
              </form>

              <div className="flex flex-wrap gap-3">
                {tags.length === 0 ? (
                  <p className="text-[var(--muted)] text-sm">Aucun tag trouvé.</p>
                ) : (
                  tags.map(tag => (
                    <div key={tag.id} className="flex items-center gap-2 pl-3 pr-1 py-1 bg-black/50 border border-[var(--surface-border)] rounded-full text-sm">
                      <span>{tag.name}</span>
                      <button
                        onClick={() => handleDeleteTag(tag.id)}
                        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-500/20 text-red-500 transition-colors"
                      >
                        &times;
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
