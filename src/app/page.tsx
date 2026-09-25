import { createClient } from '@/utils/supabase/server'
import { VideoCard } from '@/components/video/VideoCard'

export default async function Home() {
  const supabase = await createClient()

  // Get max 10 featured home videos
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .eq('is_featured_home', true)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">À la Une</h1>

      {(!videos || videos.length === 0) ? (
        <div className="text-center py-20 text-[var(--muted)]">
          Aucune vidéo à la une pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}
