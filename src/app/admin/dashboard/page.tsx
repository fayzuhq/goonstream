import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  console.log('--- DIAGNOSTIC AUTH ---')
  console.log('User ID:', user?.id)
  console.log('User Error:', userError?.message)

  if (!user) {
    console.log('--> Redirection vers /admin/login : pas de session active')
    redirect('/admin/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  console.log('Profile data:', profile)
  console.log('Profile error:', profileError?.message)
  console.log('-----------------------')

  // Si le profil n'existe pas en base, on affiche l'écran de diagnostic au lieu de boucler silencieusement
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
        <div className="w-full max-w-xl bg-[var(--surface)] border border-red-500/50 rounded-2xl p-8">
          <h1 className="text-2xl font-black text-red-500 mb-4">Profil introuvable</h1>
          <p className="text-sm text-[var(--muted)] mb-4">
            Votre compte Supabase Auth existe bien (ID : <code className="text-white bg-black/40 px-2 py-1 rounded">{user.id}</code>), 
            mais aucune ligne correspondante n&apos;a été trouvée dans la table <code className="text-white bg-black/40 px-2 py-1 rounded">profiles</code>.
          </p>
          <div className="p-4 bg-black/50 border border-[var(--surface-border)] rounded-lg text-xs font-mono text-gray-300 overflow-x-auto mb-6">
            <p className="text-[#ff9933] font-bold mb-2">Exécutez cette commande dans le SQL Editor Supabase :</p>
            <code>
              {`INSERT INTO public.profiles (id, email, role, must_change_password)
VALUES ('${user.id}', '${user.email}', 'owner', false)
ON CONFLICT (id) DO UPDATE SET role = 'owner', must_change_password = false;`}
            </code>
          </div>
          <a
            href="/admin/dashboard"
            className="inline-block py-2.5 px-6 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors"
          >
            Actualiser la page
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black">Panel Staff</h1>
        <div className="px-4 py-2 bg-[var(--surface)] border border-[var(--surface-border)] rounded-full text-sm">
          Connecté en tant que: <span className="font-bold text-[#ff9933] uppercase">{profile.role}</span>
        </div>
      </div>

      {['admin', 'owner'].includes(profile.role) && !profile.discord_id && (
        <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 p-4 rounded-xl mb-8">
          <h2 className="font-bold mb-2">Attention : Configuration 2FA requise</h2>
          <p className="text-sm">Votre rôle ({profile.role}) exige de lier votre compte Discord pour la double authentification.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Module Upload */}
        {['uploader', 'manager', 'admin', 'owner'].includes(profile.role) && (
          <div className="p-6 bg-[var(--surface)] border border-[var(--surface-border)] rounded-xl">
            <h2 className="text-xl font-bold mb-4">Module Upload</h2>
            <p className="text-sm text-[var(--muted)] mb-4">Ajouter de nouvelles vidéos à la plateforme.</p>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded font-medium transition-colors">
              Gérer
            </button>
          </div>
        )}

        {/* Module Gestion */}
        {['manager', 'admin', 'owner'].includes(profile.role) && (
          <div className="p-6 bg-[var(--surface)] border border-[var(--surface-border)] rounded-xl">
            <h2 className="text-xl font-bold mb-4">Module Gestion</h2>
            <p className="text-sm text-[var(--muted)] mb-4">Gérer les chaînes, tags, et la page d&apos;accueil.</p>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded font-medium transition-colors">
              Gérer
            </button>
          </div>
        )}

        {/* Module Modération */}
        {['moderator', 'admin', 'owner'].includes(profile.role) && (
          <div className="p-6 bg-[var(--surface)] border border-[var(--surface-border)] rounded-xl">
            <h2 className="text-xl font-bold mb-4">Module Modération</h2>
            <p className="text-sm text-[var(--muted)] mb-4">Traiter les signalements et réclamations.</p>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded font-medium transition-colors">
              Gérer
            </button>
          </div>
        )}

        {/* Module Équipe */}
        {['admin', 'owner'].includes(profile.role) && (
          <div className="p-6 bg-[var(--surface)] border border-[var(--surface-border)] rounded-xl">
            <h2 className="text-xl font-bold mb-4">Module Équipe</h2>
            <p className="text-sm text-[var(--muted)] mb-4">Gérer les accès et créer de nouveaux comptes staff.</p>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded font-medium transition-colors">
              Gérer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}