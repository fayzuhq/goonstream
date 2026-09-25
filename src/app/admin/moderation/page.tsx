'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function ModerationPage() {
  const [reports, setReports] = useState<any[]>([])

  const supabase = createClient()

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    // Dans une base réelle, faire un join avec videos
    // Ici on suppose qu'on récupère aussi les données de la vidéo liée via supabase relations
    const { data } = await supabase
      .from('reports')
      .select(`
        *,
        videos (
          id,
          title,
          thumbnail_url
        )
      `)
      .order('created_at', { ascending: false })

    if (data) setReports(data)
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    await supabase.from('reports').update({ status: newStatus }).eq('id', id)
    fetchReports()
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette vidéo définitivement ?")) {
      await supabase.from('videos').delete().eq('id', videoId)
      fetchReports() // Mettre à jour la liste des tickets
    }
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
        <h1 className="text-3xl font-black text-gradient-signature">Module Modération</h1>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Tickets de signalement</h2>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-500 rounded-full text-xs font-bold">
              {reports.filter(r => r.status === 'open').length} Ouverts
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {reports.length === 0 ? (
            <p className="text-[var(--muted)] text-center py-8">Aucun signalement pour le moment.</p>
          ) : (
            reports.map(report => (
              <div key={report.id} className={`p-4 border rounded-xl flex flex-col md:flex-row gap-4 ${report.status === 'open' ? 'bg-red-500/5 border-red-500/30' : 'bg-black/50 border-[var(--surface-border)] opacity-70'}`}>

                {/* Info Vidéo */}
                <div className="flex gap-4 md:w-1/3">
                  {report.videos ? (
                    <>
                      <img src={report.videos.thumbnail_url} alt={report.videos.title} className="w-24 h-16 object-cover rounded bg-white/10" />
                      <div>
                        <p className="font-bold text-sm line-clamp-2">{report.videos.title}</p>
                        <Link href={`/watch/${report.videos.id}`} target="_blank" className="text-xs text-[#ff3366] hover:underline">
                          Voir la vidéo &#8599;
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="w-full text-center text-[var(--muted)] text-sm py-4 italic">
                      Vidéo supprimée
                    </div>
                  )}
                </div>

                {/* Info Ticket */}
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-[var(--muted)]">Signalé le {new Date(report.created_at).toLocaleDateString()}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${report.status === 'open' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-sm bg-black/40 p-2 rounded border border-[var(--surface-border)] mt-2">
                    <span className="font-bold text-[var(--muted)]">Raison :</span> {report.reason}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-row md:flex-col justify-end gap-2 md:w-48 border-t md:border-t-0 md:border-l border-[var(--surface-border)] pt-4 md:pt-0 md:pl-4">
                  {report.status === 'open' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(report.id, 'closed')}
                        className="flex-1 py-1 px-3 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors"
                      >
                        Rejeter (Fermer)
                      </button>
                      {report.videos && (
                        <button
                          onClick={() => handleDeleteVideo(report.videos.id)}
                          className="flex-1 py-1 px-3 bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50 rounded text-sm transition-colors"
                        >
                          Supprimer vidéo
                        </button>
                      )}
                    </>
                  )}
                  {report.status !== 'open' && (
                    <button
                      onClick={() => handleStatusChange(report.id, 'open')}
                      className="flex-1 py-1 px-3 bg-white/5 hover:bg-white/10 rounded text-xs text-[var(--muted)] transition-colors"
                    >
                      Rouvrir ticket
                    </button>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
