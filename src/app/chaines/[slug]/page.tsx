import { createClient } from '@/utils/supabase/server'
import { VideoCard } from '@/components/video/VideoCard'
import { notFound } from 'next/navigation'

export default async function ChannelDetailsPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()

  const { data: channel } = await supabase
    .from('channels')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!channel) notFound()

  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .eq('channel_id', channel.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-6 mb-12 bg-[var(--surface)] p-8 rounded-3xl border border-[var(--surface-border)]">
        <div className="w-32 h-32 rounded-full overflow-hidden shrink-0 border-4 border-[#ff3366]">
          {channel.avatar_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={channel.avatar_url} alt={channel.name} className="w-full h-full object-cover" />
          )}
        </div>
        <div>
          <h1 className="text-4xl font-black mb-2">{channel.name}</h1>
          <p className="text-[var(--muted)] max-w-2xl">{channel.description}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Vidéos ({videos?.length || 0})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos?.map(video => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  )
}
