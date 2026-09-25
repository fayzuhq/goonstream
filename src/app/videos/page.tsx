import { createClient } from '@/utils/supabase/server'
import { VideoCard } from '@/components/video/VideoCard'

export default async function VideosPage({
  searchParams,
}: {
  searchParams: { sort?: string }
}) {
  const supabase = await createClient()
  const sort = searchParams.sort || 'recent'

  // Top 5 of the week (assuming RPC exists or fallback to just fetching recent)
  const { data: topVideos } = await supabase.rpc('get_top_videos_week')

  // Main videos list based on filter
  let query = supabase.from('videos').select('*')

  if (sort === 'views') {
    query = query.order('views_fake', { ascending: false })
  } else if (sort === 'duration') {
    query = query.order('duration', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: videos } = await query

  return (
    <div className="container mx-auto px-4 py-8">
      {topVideos && topVideos.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gradient-signature">Top 5 de la semaine</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {topVideos.map((video: any) => (
              <div key={video.id} className="min-w-[280px] sm:min-w-[320px] snap-start">
                <VideoCard video={video} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Toutes les vidéos</h2>
          <div className="flex gap-2">
            <a href="/videos?sort=recent" className={`px-4 py-2 rounded-full text-sm font-medium ${sort === 'recent' ? 'bg-gradient-signature text-white' : 'bg-[var(--surface)] text-[var(--muted)] hover:text-white'}`}>Plus récentes</a>
            <a href="/videos?sort=views" className={`px-4 py-2 rounded-full text-sm font-medium ${sort === 'views' ? 'bg-gradient-signature text-white' : 'bg-[var(--surface)] text-[var(--muted)] hover:text-white'}`}>Plus vues</a>
            <a href="/videos?sort=duration" className={`px-4 py-2 rounded-full text-sm font-medium ${sort === 'duration' ? 'bg-gradient-signature text-white' : 'bg-[var(--surface)] text-[var(--muted)] hover:text-white'}`}>Plus longues</a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos?.map((video: any) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>
    </div>
  )
}
