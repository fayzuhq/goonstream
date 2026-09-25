import Link from 'next/link'
import { Search } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--surface-border)]">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-black tracking-tighter uppercase text-gradient-signature">
            GOONSTREAM
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/videos" className="text-[var(--muted)] hover:text-white transition-colors">Vidéos</Link>
            <Link href="/chaines" className="text-[var(--muted)] hover:text-white transition-colors">Chaînes</Link>
            <Link href="/tag" className="text-[var(--muted)] hover:text-white transition-colors">Tags</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 bg-[var(--surface)] border border-[var(--surface-border)] rounded-full text-sm focus:outline-none focus:border-[#ff3366] transition-colors"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
