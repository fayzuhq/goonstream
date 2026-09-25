'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function TeamPage() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (data) setProfiles(data)
    setLoading(false)
  }

  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState('uploader')
  const [createMsg, setCreateMsg] = useState({ text: '', type: '' })

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateMsg({ text: 'Création en cours...', type: 'info' })

    // Note: Dans une application réelle sécurisée, la création d'utilisateur via auth.signUp
    // devrait probablement se faire côté serveur via une API Admin avec un Service Role Key
    // pour éviter d'exposer l'inscription publique ou pour assigner directement un rôle.
    // Pour ce prototype, nous simulons ou appelons signUp standard puis on met à jour le profil.

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: newEmail,
      password: newPassword,
    })

    if (authError) {
      setCreateMsg({ text: `Erreur: ${authError.message}`, type: 'error' })
      return
    }

    if (authData.user) {
      // Mettre à jour le profil avec le rôle choisi (si RLS permet, sinon ça échouera)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: newRole, must_change_password: true })
        .eq('id', authData.user.id)

      if (profileError) {
        setCreateMsg({ text: `Compte créé mais erreur profil: ${profileError.message}`, type: 'error' })
      } else {
        setCreateMsg({ text: 'Compte staff créé avec succès !', type: 'success' })
        setNewEmail('')
        setNewPassword('')
        fetchProfiles()
      }
    }
  }

  const handleDeleteStaff = async (id: string) => {
    if (window.confirm("Voulez-vous vraiment révoquer cet accès staff ? (Le profil sera supprimé)")) {
      await supabase.from('profiles').delete().eq('id', id)
      fetchProfiles()
    }
  }

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'owner': return 'text-[#ff9933] border-[#ff9933]'
      case 'admin': return 'text-[#ff3366] border-[#ff3366]'
      case 'manager': return 'text-purple-500 border-purple-500'
      case 'moderator': return 'text-green-500 border-green-500'
      case 'uploader': return 'text-blue-500 border-blue-500'
      default: return 'text-gray-500 border-gray-500'
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
        <h1 className="text-3xl font-black text-gradient-signature">Module Équipe</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Liste du staff */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold mb-4">Membres de l&apos;équipe</h2>
          {loading ? (
            <p className="text-[var(--muted)]">Chargement...</p>
          ) : (
            profiles.map(profile => (
              <div key={profile.id} className="p-4 bg-[var(--surface)] border border-[var(--surface-border)] rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold">{profile.email || 'Email inconnu'}</p>
                  <p className="text-xs text-[var(--muted)] font-mono mt-1">ID: {profile.id}</p>
                  {profile.must_change_password && (
                    <span className="inline-block mt-2 text-[10px] uppercase tracking-wider px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded border border-yellow-500/30">
                      Doit changer de mot de passe
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full border bg-black/50 ${getRoleColor(profile.role)}`}>
                    {profile.role}
                  </span>
                  {profile.role !== 'owner' && (
                    <button
                      onClick={() => handleDeleteStaff(profile.id)}
                      className="text-xs text-[var(--muted)] hover:text-red-500 transition-colors"
                    >
                      Révoquer
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Formulaire de création */}
        <div>
          <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-2xl p-6 sticky top-8">
            <h2 className="text-xl font-bold mb-6">Ajouter un Staff</h2>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">Adresse Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full p-3 bg-black/50 border border-[var(--surface-border)] rounded-xl focus:outline-none focus:border-[#ff3366] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">Mot de passe provisoire</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="ex: StaffTemp123!"
                  className="w-full p-3 bg-black/50 border border-[var(--surface-border)] rounded-xl focus:outline-none focus:border-[#ff3366] transition-colors font-mono"
                  required
                />
                <p className="text-xs text-[var(--muted)] mt-1">L&apos;utilisateur devra le changer à la première connexion.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">Rôle assigné</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  className="w-full p-3 bg-black/50 border border-[var(--surface-border)] rounded-xl focus:outline-none focus:border-[#ff3366] transition-colors appearance-none"
                >
                  <option value="uploader">Uploader (Ajout vidéos)</option>
                  <option value="moderator">Modérateur (Gestion tickets)</option>
                  <option value="manager">Manager (Upload + Gestion + Modération)</option>
                  <option value="admin">Administrateur (Accès total sauf Owner)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-4 bg-gradient-signature rounded-xl font-bold text-white hover:opacity-90 transition-opacity"
              >
                Créer le compte
              </button>

              {createMsg.text && (
                <div className={`p-3 rounded-lg text-sm mt-4 border ${
                  createMsg.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-500' :
                  createMsg.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-500' :
                  'bg-blue-500/10 border-blue-500/50 text-blue-500'
                }`}>
                  {createMsg.text}
                </div>
              )}
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}
