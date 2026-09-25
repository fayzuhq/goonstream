'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export function ReportModal({ videoId }: { videoId: string }) {
  const [show, setShow] = useState(false)
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) return

    const supabase = createClient()
    await supabase.from('reports').insert({ video_id: videoId, reason })
    setSubmitted(true)
  }

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="text-sm font-medium text-[var(--muted)] hover:text-white underline"
      >
        Signaler un problème
      </button>

      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4">
          <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-xl p-8 max-w-md w-full relative">
            <button
              onClick={() => setShow(false)}
              className="absolute top-4 right-4 text-[var(--muted)] hover:text-white"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">Signaler la vidéo</h2>

            {submitted ? (
              <p className="text-green-500">Signalement envoyé avec succès.</p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <textarea
                  required
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Veuillez décrire le problème..."
                  className="w-full p-3 bg-black/50 border border-[var(--surface-border)] rounded-lg text-sm focus:outline-none focus:border-[#ff3366]"
                />
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-gradient-signature text-white font-bold rounded-lg hover:opacity-90"
                >
                  Envoyer
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
