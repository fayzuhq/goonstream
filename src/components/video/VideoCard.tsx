import Link from 'next/link'
import Image from 'next/image'

interface Video {
  id: string
  title: string
  duration: string
  views_fake: number
  thumbnail_url: string
  created_at: string
}

export function VideoCard({ video }: { video: Video }) {
  return (
    <Link href={`/watch/${video.id}`} className="group block">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-[var(--surface)] border border-[var(--surface-border)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
          {video.duration}
        </div>
      </div>
      <div className="mt-3">
        <h3 className="font-medium text-white line-clamp-2 group-hover:text-[#ff3366] transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-sm text-[var(--muted)]">
          <span>{video.views_fake.toLocaleString()} vues</span>
          <span>•</span>
          <span>{new Date(video.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  )
}
