import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function ChannelsPage() {
  const supabase = await createClient()

  // Using count to get video count per channel is ideally done via a view or RPC,
  // For simplicity, we just fetch channels.
  const { data: channels } = await supabase.from('channels').select('*').order('name')

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Chaînes</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {channels?.map(channel => (
          <Link href={`/chaines/${channel.slug}`} key={channel.id} className="group flex flex-col items-center p-6 bg-[var(--surface)] border border-[var(--surface-border)] rounded-2xl hover:border-[#ff3366] transition-colors">
            <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-black/50 border-2 border-[var(--surface-border)] group-hover:border-[#ff9933] transition-colors">
              {channel.avatar_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={channel.avatar_url} alt={channel.name} className="w-full h-full object-cover" />
              )}
            </div>
            <h2 className="font-bold text-center group-hover:text-gradient-signature">{channel.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  )
}
