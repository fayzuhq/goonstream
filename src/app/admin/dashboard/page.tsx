import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/admin/login')

  // Check 2FA requirement for admin & owner
  if (['admin', 'owner'].includes(profile.role) && !profile.discord_id) {
    // In a real app, we would redirect to a Discord OAuth2 flow here
    // For now, we simulate the requirement by showing a warning block
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
        {/* Module Upload: all roles except maybe moderator if strictly separate, but usually uploader and up */}
        {['uploader', 'manager', 'admin', 'owner'].includes(profile.role) && (
          <div className="p-6 bg-[var(--surface)] border border-[var(--surface-border)] rounded-xl">
            <h2 className="text-xl font-bold mb-4">Module Upload</h2>
            <p className="text-sm text-[var(--muted)] mb-4">Ajouter de nouvelles vidéos à la plateforme.</p>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded font-medium transition-colors">
              Gérer
            </button>
          </div>
        )}

        {/* Module Gestion: manager, admin, owner */}
        {['manager', 'admin', 'owner'].includes(profile.role) && (
          <div className="p-6 bg-[var(--surface)] border border-[var(--surface-border)] rounded-xl">
            <h2 className="text-xl font-bold mb-4">Module Gestion</h2>
            <p className="text-sm text-[var(--muted)] mb-4">Gérer les chaînes, tags, et la page d&apos;accueil.</p>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded font-medium transition-colors">
              Gérer
            </button>
          </div>
        )}

        {/* Module Modération: moderator, admin, owner */}
        {['moderator', 'admin', 'owner'].includes(profile.role) && (
          <div className="p-6 bg-[var(--surface)] border border-[var(--surface-border)] rounded-xl">
            <h2 className="text-xl font-bold mb-4">Module Modération</h2>
            <p className="text-sm text-[var(--muted)] mb-4">Traiter les signalements et réclamations.</p>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded font-medium transition-colors">
              Gérer
            </button>
          </div>
        )}

        {/* Module Staff: admin, owner */}
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
