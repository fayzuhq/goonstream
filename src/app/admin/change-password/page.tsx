'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function ChangePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    // Update profile
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ must_change_password: false }).eq('id', user.id)
    }

    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--surface-border)] rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Initialisation</h1>
        <p className="text-[var(--muted)] text-center mb-8">Veuillez définir votre mot de passe définitif.</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium mb-2">Nouveau mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-black/50 border border-[var(--surface-border)] rounded-lg focus:outline-none focus:border-[#ff3366]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Confirmer le mot de passe</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full p-3 bg-black/50 border border-[var(--surface-border)] rounded-lg focus:outline-none focus:border-[#ff3366]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-gradient-signature text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : 'Mettre à jour'}
          </button>
        </form>
      </div>
    </div>
  )
}
