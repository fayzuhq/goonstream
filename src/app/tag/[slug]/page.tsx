import { createClient } from '@/utils/supabase/server'
import { VideoCard } from '@/components/video/VideoCard'
import { notFound } from 'next/navigation'

export default async function TagDetailsPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()

  const { data: tag } = await supabase
    .from('tags')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!tag) notFound()

  const { data: videoTags } = await supabase
    .from('video_tags')
    .select('videos(*)')
    .eq('tag_id', tag.id)

  const videos = videoTags?.map(vt => vt.videos).flat() || []

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">#{tag.name}</h1>
      <p className="text-[var(--muted)] mb-8">{videos.length} vidéos trouvées</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos.map(video => (
          // @ts-ignore
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  )
}
