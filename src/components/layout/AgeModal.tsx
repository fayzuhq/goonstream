'use client'
import { useState, useEffect } from 'react'

export function AgeModal() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const hasConsent = document.cookie.split('; ').find(row => row.startsWith('age_consent='))
    if (!hasConsent) {
      setTimeout(() => setShow(true), 0)
    }
  }, [])

  const handleConsent = () => {
    document.cookie = "age_consent=true; path=/; max-age=31536000"
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4">
      <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Avertissement Légale</h2>
        <p className="text-[var(--muted)] mb-8">
          Ce site contient du contenu pour adultes. Vous devez avoir au moins 18 ans ou avoir atteint l&apos;âge de la majorité dans votre pays pour y accéder.
        </p>
        <button
          onClick={handleConsent}
          className="w-full py-3 px-4 bg-gradient-signature text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
        >
          Je certifie avoir 18 ans ou plus
        </button>
      </div>
    </div>
  )
}
