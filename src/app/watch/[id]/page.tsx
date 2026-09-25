import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ReportModal } from '@/components/video/ReportModal'

export default async function WatchPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Verify ID format simplistic check (UUID length)
  if (params.id.length !== 36) notFound()

  const { data: video } = await supabase
    .from('videos')
    .select('*, channels(*)')
    .eq('id', params.id)
    .single()

  if (!video) notFound()

  const { data: videoTags } = await supabase
    .from('video_tags')
    .select('tags(*)')
    .eq('video_id', video.id)

  const tags = videoTags?.map(vt => vt.tags).flat() || []

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="aspect-video w-full bg-black rounded-xl overflow-hidden mb-6 border border-[var(--surface-border)] relative">
        <iframe
          src={video.video_url}
          className="w-full h-full border-0 absolute inset-0"
          allowFullScreen
        ></iframe>
      </div>

      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">{video.title}</h1>

        <div className="flex items-center justify-between pb-6 border-b border-[var(--surface-border)]">
          <div className="flex items-center gap-4 text-[var(--muted)] text-sm">
            <span>{video.views_fake.toLocaleString()} vues</span>
            <span>•</span>
            <span>{new Date(video.created_at).toLocaleDateString()}</span>
            <span>•</span>
            <span>{video.duration}</span>
          </div>
          <ReportModal videoId={video.id} />
        </div>

        <div className="flex items-center gap-4 py-4">
          {video.channels && (
            <Link href={`/chaines/${(video.channels as any).slug}`} className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--surface)]">
                {(video.channels as any).avatar_url && <img src={(video.channels as any).avatar_url} alt={(video.channels as any).name} className="w-full h-full object-cover" />}
              </div>
              <div>
                <h3 className="font-bold group-hover:text-gradient-signature">{(video.channels as any).name}</h3>
              </div>
            </Link>
          )}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag: any) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className="px-3 py-1 bg-[var(--surface)] border border-[var(--surface-border)] rounded-full text-xs font-medium hover:border-[#ff9933] hover:text-[#ff9933] transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
